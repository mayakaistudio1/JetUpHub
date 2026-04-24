/**
 * Sofia Recruiting Chat — automated evaluation harness.
 *
 * Runs three kinds of test cases against the *current* Sofia recruiting prompt
 * and produces a transcript + judge-scored report. Designed for regression:
 * keep prior runs, diff against them with `diff.ts`.
 *
 * Test inputs:
 *   1. personas.json  — multi-turn dialogues, a 2nd LLM plays the guest persona
 *   2. scenarios.json — short scripted message sequences (single intent)
 *   3. real-questions — actual user questions pulled from chat_messages table
 *      (--include-real, default ON; disable with --no-real)
 *
 * Outputs to: exports/sofia-evals/<runId>/
 *   - meta.json              run config + prompt hash
 *   - transcripts/*.md       human-readable transcripts
 *   - report.json            machine-readable per-case scores
 *   - report.md              summary table
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  MARIA_RECRUITING_PROMPT_DE,
  MARIA_RECRUITING_PROMPT_EN,
  MARIA_RECRUITING_PROMPT_RU,
} from "../../server/integrations/maria-chat";

type Lang = "de" | "en" | "ru";
interface Persona {
  id: string;
  lang: Lang;
  name: string;
  profile: string;
  opening: string;
  max_turns: number;
}
interface Scenario {
  id: string;
  lang: Lang;
  messages: string[];
}
interface Turn {
  role: "user" | "assistant";
  content: string;
}
interface JudgeScore {
  introduces_as_sofia: boolean;
  no_maria_self_reference: boolean;
  language_consistent: boolean;
  has_next_step_cta: boolean;
  on_topic: boolean;
  tone_warm_pro: boolean;
  max_words_respected: boolean;
  handles_objection_correctly: boolean | null;
  redirects_tech_to_partner: boolean | null;
  overall_score: number;
  notes: string;
}
interface CaseResult {
  caseId: string;
  kind: "persona" | "scenario" | "real";
  lang: Lang;
  turns: Turn[];
  judge: JudgeScore;
}

// ─────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const includeReal = !argv.includes("--no-real");
const realLimit = parseInt(getArg("--real-limit", "30"));
const personasOnly = argv.includes("--personas-only");
const scenariosOnly = argv.includes("--scenarios-only");
const realOnly = argv.includes("--real-only");
const langFilter = getArg("--lang", "");
const judgeModel = getArg("--judge", "gpt-4o-mini");
const sofiaModel = getArg("--sofia", "gpt-4o-mini");
const guestModel = getArg("--guest", "gpt-4o-mini");
const runIdOverride = getArg("--run-id", "");

function getArg(name: string, def = "") {
  const i = argv.indexOf(name);
  if (i >= 0 && i + 1 < argv.length) return argv[i + 1];
  return def;
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function sofiaPrompt(lang: Lang): string {
  if (lang === "en") return MARIA_RECRUITING_PROMPT_EN;
  if (lang === "ru") return MARIA_RECRUITING_PROMPT_RU;
  return MARIA_RECRUITING_PROMPT_DE;
}

async function sofiaReply(lang: Lang, history: Turn[]): Promise<string> {
  const resp = await openai.chat.completions.create({
    model: sofiaModel,
    temperature: 0.8,
    max_tokens: 200,
    messages: [
      { role: "system", content: sofiaPrompt(lang) },
      ...history.map((m) => ({ role: m.role, content: m.content }) as const),
    ],
  });
  return resp.choices[0]?.message?.content?.trim() || "";
}

async function guestReply(persona: Persona, history: Turn[]): Promise<string> {
  const guestSystem = `You are role-playing a website visitor.
Persona: ${persona.name}.
Behaviour: ${persona.profile}
Language: respond in ${persona.lang.toUpperCase()}.
Style: short casual chat messages (1-3 sentences). Never break character.
Do not be too cooperative — react naturally based on the persona.
After Sofia answers, ask a follow-up that the persona would actually ask.
If the conversation has clearly reached its goal (you got the info you wanted, or you'd realistically leave), output exactly: <END>`;
  const messages = [
    { role: "system" as const, content: guestSystem },
    // Flip roles so guest LLM sees Sofia as "user" and itself as "assistant"
    ...history.map((m) => ({
      role: m.role === "assistant" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  ];
  const resp = await openai.chat.completions.create({
    model: guestModel,
    temperature: 0.9,
    max_tokens: 120,
    messages,
  });
  return resp.choices[0]?.message?.content?.trim() || "<END>";
}

async function runPersona(persona: Persona): Promise<CaseResult> {
  const history: Turn[] = [{ role: "user", content: persona.opening }];
  for (let turn = 0; turn < persona.max_turns; turn++) {
    const sofia = await sofiaReply(persona.lang, history);
    history.push({ role: "assistant", content: sofia });
    if (turn === persona.max_turns - 1) break;
    const guest = await guestReply(persona, history);
    if (guest.includes("<END>") || !guest) break;
    history.push({ role: "user", content: guest });
  }
  const judge = await judgeDialog(persona.lang, history, "persona");
  return { caseId: persona.id, kind: "persona", lang: persona.lang, turns: history, judge };
}

async function runScenario(sc: Scenario): Promise<CaseResult> {
  const history: Turn[] = [];
  for (const userMsg of sc.messages) {
    history.push({ role: "user", content: userMsg });
    const sofia = await sofiaReply(sc.lang, history);
    history.push({ role: "assistant", content: sofia });
  }
  const judge = await judgeDialog(sc.lang, history, "scenario");
  return { caseId: sc.id, kind: "scenario", lang: sc.lang, turns: history, judge };
}

async function judgeDialog(lang: Lang, turns: Turn[], kind: string): Promise<JudgeScore> {
  const transcript = turns.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n");
  const rubric = `You are an evaluator for the JetUP "Sofia" recruiting AI on the /explore landing page.

Important context:
- Sofia is the RECRUITING assistant (presentation, partner program, application, money/risk overview).
- "Maria" is a SEPARATE assistant that lives in the JetUP partner hub for technical questions.
- For login problems, MetaTrader setup, BIT One sync, password issues, account-specific things,
  Sofia should NOT solve them — she should warmly redirect to the partner area
  (where Maria and the team live). Mentioning Maria as a separate person/AI in the partner area
  is CORRECT behavior, not a violation.

Score the assistant (Sofia) replies against these rules:

- introduces_as_sofia: If Sofia explicitly introduces herself, she calls herself "Sofia". If she
  doesn't introduce herself at all (e.g. user came in mid-flow with a direct question), mark TRUE.
  Mark FALSE only if Sofia introduces herself with a name OTHER THAN Sofia.
- no_maria_self_reference: Sofia never claims to BE Maria. Saying things like
  "Maria is also there in the partner area" is FINE and should be TRUE.
- language_consistent: Sofia replies in ${lang.toUpperCase()} consistently (matches user language).
- has_next_step_cta: At least one Sofia reply guides toward a concrete next step
  (apply, scroll to form, view interactive presentation, register, partner area).
- on_topic: Sofia stays on JetUP / recruiting topics and politely deflects truly off-topic asks
  (jokes, weather, politics, unrelated companies). Redirecting tech questions to the partner area
  is on-topic, not off-topic.
- tone_warm_pro: Tone is warm, brief, human, no pressure.
- max_words_respected: No Sofia reply substantially exceeds ~35 words. Mark FALSE only if multiple
  replies clearly violate.
- handles_objection_correctly: If the user raised an objection (MLM, scam, risk, no time,
  no experience, money), Sofia addressed it consistently with the prompt's objection list.
  Use null if no objection was raised.
- redirects_tech_to_partner: If the user asked a TECHNICAL / account question
  (login fail, password incorrect, MetaTrader install, BIT1 sync, "I don't see my $100",
  "how do I contact support", concrete account/balance issues), did Sofia redirect to the
  partner area / Maria instead of trying to solve it? Use null if no such question was asked.

Plus:
- overall_score: integer 0..10 (10 = great, 5 = mediocre, 0 = broken).
- notes: 1-2 sentences with the most important observation (what to fix in the prompt).

Return STRICT JSON ONLY, no prose, with this exact shape:
{
  "introduces_as_sofia": true,
  "no_maria_self_reference": true,
  "language_consistent": true,
  "has_next_step_cta": true,
  "on_topic": true,
  "tone_warm_pro": true,
  "max_words_respected": true,
  "handles_objection_correctly": true,
  "redirects_tech_to_partner": null,
  "overall_score": 8,
  "notes": "..."
}

Transcript (${kind}, lang=${lang}):
---
${transcript}
---`;
  const resp = await openai.chat.completions.create({
    model: judgeModel,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: rubric }],
  });
  const raw = resp.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw);
    const nullable = (v: unknown) => (v === null || v === undefined ? null : !!v);
    return {
      introduces_as_sofia: !!parsed.introduces_as_sofia,
      no_maria_self_reference: !!(parsed.no_maria_self_reference ?? parsed.no_maria_mentions),
      language_consistent: !!parsed.language_consistent,
      has_next_step_cta: !!parsed.has_next_step_cta,
      on_topic: !!parsed.on_topic,
      tone_warm_pro: !!parsed.tone_warm_pro,
      max_words_respected: !!parsed.max_words_respected,
      handles_objection_correctly: nullable(parsed.handles_objection_correctly),
      redirects_tech_to_partner: nullable(parsed.redirects_tech_to_partner),
      overall_score: Number(parsed.overall_score) || 0,
      notes: String(parsed.notes || ""),
    };
  } catch {
    return blankJudge("Judge returned invalid JSON.");
  }
}

function blankJudge(notes: string): JudgeScore {
  return {
    introduces_as_sofia: false,
    no_maria_self_reference: false,
    language_consistent: false,
    has_next_step_cta: false,
    on_topic: false,
    tone_warm_pro: false,
    max_words_respected: false,
    handles_objection_correctly: null,
    redirects_tech_to_partner: null,
    overall_score: 0,
    notes,
  };
}

async function fetchRealUserQuestions(limit: number): Promise<{ id: string; lang: Lang; content: string }[]> {
  // Prefer a pre-extracted prod file (extract-prod-questions.ts) if present —
  // that data set is much richer than the local dev DB.
  const prodFile = path.join(__dirname, "real-questions-prod.json");
  if (fs.existsSync(prodFile)) {
    const data = JSON.parse(fs.readFileSync(prodFile, "utf8")) as {
      questions: { id: string; lang: Lang; content: string }[];
    };
    // Filter by lang BEFORE sampling so --real-limit means
    // "this many real questions in the chosen language".
    const pool = langFilter
      ? data.questions.filter((q) => q.lang === langFilter)
      : data.questions;
    const seedArg = getArg("--real-seed", "");
    const rand = seedArg ? mulberry32(hashStr(seedArg)) : Math.random;
    const shuffled = [...pool].sort(() => rand() - 0.5);
    return shuffled.slice(0, limit);
  }
  // Lazy import to avoid pulling DB unless needed.
  const { db } = await import("../../server/db");
  const { chatMessages, chatSessions } = await import("../../shared/schema");
  const { sql, eq, desc } = await import("drizzle-orm");
  const rows = await db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
      sessionId: chatMessages.sessionId,
      language: chatSessions.language,
    })
    .from(chatMessages)
    .leftJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.sessionId))
    .where(eq(chatMessages.role, "user"))
    .orderBy(desc(chatMessages.timestamp))
    .limit(limit * 4); // overfetch, then dedupe
  const seen = new Set<string>();
  const out: { id: string; lang: Lang; content: string }[] = [];
  for (const r of rows) {
    const txt = (r.content || "").trim();
    if (!txt || txt.length < 3 || txt.length > 400) continue;
    const key = txt.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const lang: Lang = r.language === "en" ? "en" : r.language === "ru" ? "ru" : "de";
    out.push({ id: `real_${r.id}`, lang, content: txt });
    if (out.length >= limit) break;
  }
  return out;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function timestampId() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function promptHash(): string {
  const all = MARIA_RECRUITING_PROMPT_DE + MARIA_RECRUITING_PROMPT_EN + MARIA_RECRUITING_PROMPT_RU;
  return crypto.createHash("sha256").update(all).digest("hex").slice(0, 12);
}

function transcriptToMd(c: CaseResult): string {
  const lines: string[] = [];
  lines.push(`# ${c.caseId} (${c.kind}, ${c.lang})`);
  lines.push("");
  lines.push(`**Score:** ${c.judge.overall_score}/10  `);
  lines.push(`**Notes:** ${c.judge.notes}`);
  lines.push("");
  lines.push("## Transcript");
  for (const t of c.turns) {
    const who = t.role === "user" ? "👤 USER" : "🤖 SOFIA";
    lines.push(`**${who}:** ${t.content}`);
    lines.push("");
  }
  lines.push("## Judge");
  lines.push("```json");
  lines.push(JSON.stringify(c.judge, null, 2));
  lines.push("```");
  return lines.join("\n");
}

function reportMd(results: CaseResult[]): string {
  const avg =
    results.length === 0 ? 0 : results.reduce((a, b) => a + b.judge.overall_score, 0) / results.length;
  const fails = (key: keyof JudgeScore) =>
    results.filter((r) => r.judge[key] === false).length;
  const lines: string[] = [];
  lines.push(`# Sofia Eval Report`);
  lines.push("");
  lines.push(`- Cases: **${results.length}**`);
  lines.push(`- Average score: **${avg.toFixed(2)}/10**`);
  const techRedirectFails = results.filter(
    (r) => r.judge.redirects_tech_to_partner === false,
  ).length;
  const techRedirectTotal = results.filter(
    (r) => r.judge.redirects_tech_to_partner !== null,
  ).length;
  lines.push(`- Fails — sofia-introduces: **${fails("introduces_as_sofia")}**`);
  lines.push(`- Fails — Sofia self-reference as Maria: **${fails("no_maria_self_reference")}**`);
  lines.push(`- Fails — language consistent: **${fails("language_consistent")}**`);
  lines.push(`- Fails — has CTA: **${fails("has_next_step_cta")}**`);
  lines.push(`- Fails — on topic: **${fails("on_topic")}**`);
  lines.push(`- Fails — tone: **${fails("tone_warm_pro")}**`);
  lines.push(`- Fails — max 35 words: **${fails("max_words_respected")}**`);
  lines.push(`- Tech-redirect: **${techRedirectTotal - techRedirectFails}/${techRedirectTotal}** ok`);
  lines.push("");
  lines.push("## Per-case scores");
  lines.push("");
  lines.push("| Case | Kind | Lang | Score | Notes |");
  lines.push("|---|---|---|---|---|");
  for (const r of [...results].sort((a, b) => a.judge.overall_score - b.judge.overall_score)) {
    const note = (r.judge.notes || "").replace(/\|/g, "\\|").slice(0, 140);
    lines.push(`| ${r.caseId} | ${r.kind} | ${r.lang} | ${r.judge.overall_score} | ${note} |`);
  }
  return lines.join("\n");
}

async function main() {
  const personas: Persona[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "personas.json"), "utf8"),
  ).personas;
  const scenarios: Scenario[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "scenarios.json"), "utf8"),
  ).scenarios;

  const runId = runIdOverride || timestampId();
  const outDir = path.resolve(process.cwd(), "exports", "sofia-evals", runId);
  fs.mkdirSync(path.join(outDir, "transcripts"), { recursive: true });

  const langPass = (l: Lang) => !langFilter || langFilter === l;
  const filteredPersonas = personas.filter((p) => langPass(p.lang));
  const filteredScenarios = scenarios.filter((s) => langPass(s.lang));

  let realCases: { id: string; lang: Lang; content: string }[] = [];
  if (includeReal && !personasOnly) {
    try {
      const all = await fetchRealUserQuestions(realLimit);
      realCases = all.filter((r) => langPass(r.lang));
      console.log(`[sofia-eval] pulled ${realCases.length} real user questions`);
    } catch (e) {
      console.warn("[sofia-eval] could not fetch real questions:", (e as Error).message);
    }
  }

  const meta = {
    runId,
    startedAt: new Date().toISOString(),
    promptHash: promptHash(),
    sofiaModel,
    guestModel,
    judgeModel,
    counts: {
      personas: scenariosOnly ? 0 : filteredPersonas.length,
      scenarios: personasOnly ? 0 : filteredScenarios.length,
      real: realCases.length,
    },
    flags: { includeReal, personasOnly, scenariosOnly, langFilter },
  };
  fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));

  const results: CaseResult[] = [];
  const limit = 5; // concurrency
  const queue: Array<() => Promise<CaseResult>> = [];

  if (!scenariosOnly && !realOnly) {
    for (const p of filteredPersonas) queue.push(() => runPersona(p));
  }
  if (!personasOnly && !realOnly) {
    for (const s of filteredScenarios) queue.push(() => runScenario(s));
  }
  if (!personasOnly) {
    for (const r of realCases)
      queue.push(() => runScenario({ id: r.id, lang: r.lang, messages: [r.content] }));
  }

  console.log(`[sofia-eval] runId=${runId} cases=${queue.length} concurrency=${limit}`);

  let done = 0;
  async function worker() {
    while (queue.length) {
      const job = queue.shift();
      if (!job) break;
      try {
        const r = await job();
        results.push(r);
        fs.writeFileSync(
          path.join(outDir, "transcripts", `${r.caseId}.md`),
          transcriptToMd(r),
        );
        done++;
        if (done % 5 === 0 || queue.length === 0) {
          console.log(`[sofia-eval] ${done} done, ${queue.length} left`);
        }
      } catch (e) {
        console.error("[sofia-eval] case failed:", (e as Error).message);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(outDir, "report.md"), reportMd(results));
  console.log(`[sofia-eval] done → ${outDir}/report.md`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
