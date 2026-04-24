/**
 * Re-judge an existing run with the current rubric, without regenerating
 * Sofia/guest replies. Reads the source run's report.json (which contains
 * full transcripts), re-runs the judge, and writes a NEW run dir.
 *
 *   tsx scripts/sofia-eval/rejudge.ts <source-runId> [--judge gpt-4o-mini]
 *
 * Cheap: only one judge call per case.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const src = argv[0];
if (!src) {
  console.error("Usage: tsx scripts/sofia-eval/rejudge.ts <source-runId> [--judge model]");
  process.exit(1);
}
function getArg(name: string, def = "") {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
}
const judgeModel = getArg("--judge", "gpt-4o-mini");

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Re-import judge + helpers from run.ts by duplicating the rubric here
// (keeps rejudge self-contained and not coupled to run.ts internals).
type Lang = "de" | "en" | "ru";
interface Turn { role: "user" | "assistant"; content: string }

async function judge(lang: Lang, turns: Turn[], kind: string) {
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
- language_consistent: Sofia replies in ${lang.toUpperCase()} consistently.
- has_next_step_cta: At least one Sofia reply guides toward a concrete next step.
- on_topic: Sofia stays on JetUP / recruiting topics. Redirecting tech questions to the partner area is on-topic.
- tone_warm_pro: Tone is warm, brief, human, no pressure.
- max_words_respected: No Sofia reply substantially exceeds ~35 words.
- handles_objection_correctly: If user raised an objection, did Sofia address it. null if no objection.
- redirects_tech_to_partner: For technical/account questions, did Sofia redirect to partner area / Maria
  instead of trying to solve it? null if no such question.

Plus:
- overall_score: integer 0..10.
- notes: 1-2 sentences with the most important observation.

Return STRICT JSON only with this exact shape:
{"introduces_as_sofia":true,"no_maria_self_reference":true,"language_consistent":true,"has_next_step_cta":true,"on_topic":true,"tone_warm_pro":true,"max_words_respected":true,"handles_objection_correctly":true,"redirects_tech_to_partner":null,"overall_score":8,"notes":"..."}

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
}

async function main() {
  const srcDir = path.resolve(process.cwd(), "exports", "sofia-evals", src);
  const reportPath = path.join(srcDir, "report.json");
  if (!fs.existsSync(reportPath)) throw new Error(`report.json not found at ${reportPath}`);
  const cases: any[] = JSON.parse(fs.readFileSync(reportPath, "utf8"));

  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const newId = `rejudge-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-of-${src}`;
  const outDir = path.resolve(process.cwd(), "exports", "sofia-evals", newId);
  fs.mkdirSync(path.join(outDir, "transcripts"), { recursive: true });

  const meta = JSON.parse(fs.readFileSync(path.join(srcDir, "meta.json"), "utf8"));
  meta.rejudgedFrom = src;
  meta.rejudgedAt = new Date().toISOString();
  meta.judgeModel = judgeModel;
  fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));

  console.log(`[rejudge] ${cases.length} cases, source=${src}, new=${newId}`);
  const limit = 5;
  const queue = cases.slice();
  const results: any[] = [];
  let done = 0;

  async function worker() {
    while (queue.length) {
      const c = queue.shift();
      if (!c) break;
      try {
        const newJudge = await judge(c.lang, c.turns, c.kind);
        const updated = { ...c, judge: newJudge };
        results.push(updated);
        const md = [
          `# ${c.caseId} (${c.kind}, ${c.lang})`,
          ``,
          `**Score:** ${newJudge.overall_score}/10  `,
          `**Notes:** ${newJudge.notes}`,
          ``,
          `## Transcript`,
          ...c.turns.map(
            (t: Turn) =>
              `**${t.role === "user" ? "👤 USER" : "🤖 SOFIA"}:** ${t.content}\n`,
          ),
          `## Judge`,
          "```json",
          JSON.stringify(newJudge, null, 2),
          "```",
        ].join("\n");
        fs.writeFileSync(path.join(outDir, "transcripts", `${c.caseId}.md`), md);
        done++;
        if (done % 5 === 0 || queue.length === 0)
          console.log(`[rejudge] ${done}/${cases.length}`);
      } catch (e) {
        console.error("rejudge case failed:", c.caseId, (e as Error).message);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(results, null, 2));
  // reuse run.ts reportMd via duplication kept simple — quick summary here
  const avg = results.reduce((s, r) => s + r.judge.overall_score, 0) / Math.max(1, results.length);
  const fails = (k: string) => results.filter((r) => r.judge[k] === false).length;
  const techOk = results.filter((r) => r.judge.redirects_tech_to_partner === true).length;
  const techTot = results.filter((r) => r.judge.redirects_tech_to_partner !== null).length;
  const md = [
    `# Sofia Eval Report (re-judged from ${src})`,
    ``,
    `- Cases: **${results.length}**`,
    `- Average score: **${avg.toFixed(2)}/10**`,
    `- Fails — introduces as Sofia: **${fails("introduces_as_sofia")}**`,
    `- Fails — Sofia self-ref as Maria: **${fails("no_maria_self_reference")}**`,
    `- Fails — language consistent: **${fails("language_consistent")}**`,
    `- Fails — has CTA: **${fails("has_next_step_cta")}**`,
    `- Fails — on topic: **${fails("on_topic")}**`,
    `- Fails — tone: **${fails("tone_warm_pro")}**`,
    `- Fails — max 35 words: **${fails("max_words_respected")}**`,
    `- Tech-redirect: **${techOk}/${techTot}** ok`,
    ``,
    `## Per-case scores`,
    ``,
    `| Case | Lang | Score | Tech-redirect | Notes |`,
    `|---|---|---|---|---|`,
    ...[...results]
      .sort((a, b) => a.judge.overall_score - b.judge.overall_score)
      .map(
        (r) =>
          `| ${r.caseId} | ${r.lang} | ${r.judge.overall_score} | ${r.judge.redirects_tech_to_partner === null ? "—" : r.judge.redirects_tech_to_partner ? "✓" : "✗"} | ${(r.judge.notes || "").replace(/\|/g, "\\|").slice(0, 120)} |`,
      ),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "report.md"), md);
  console.log(`[rejudge] done → ${outDir}/report.md`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
