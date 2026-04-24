/**
 * Parse a chat-sessions.csv export from production and emit a deduped
 * list of user questions as JSON.
 *
 *   tsx scripts/sofia-eval/extract-prod-questions.ts <input.csv> [output.json]
 *
 * Default output: scripts/sofia-eval/real-questions-prod.json
 *
 * Picks role=user rows, normalizes whitespace, drops empties / dupes /
 * obvious junk, keeps the language tag from the session.
 */
import fs from "node:fs";
import path from "node:path";

type Lang = "de" | "en" | "ru";
interface Q {
  id: string;
  lang: Lang;
  content: string;
}

const inputArg = process.argv[2];
const outArg = process.argv[3];
if (!inputArg) {
  console.error("Usage: tsx scripts/sofia-eval/extract-prod-questions.ts <input.csv> [output.json]");
  process.exit(1);
}
const outPath =
  outArg || path.resolve(process.cwd(), "scripts", "sofia-eval", "real-questions-prod.json");

const raw = fs.readFileSync(inputArg, "utf8");

// Minimal CSV parser that handles quoted fields with embedded commas / newlines / "" escapes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      cur.push(field);
      field = "";
      continue;
    }
    if (c === "\n") {
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = "";
      continue;
    }
    if (c === "\r") continue;
    field += c;
  }
  if (field.length || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

const rows = parseCsv(raw);
const header = rows.shift() || [];
const idx = (name: string) => header.indexOf(name);
const iLang = idx("language");
const iRole = idx("role");
const iContent = idx("content");
const iSession = idx("session_id");
const iTs = idx("message_timestamp");
if (iRole < 0 || iContent < 0 || iLang < 0) {
  console.error("CSV missing required columns. Headers:", header);
  process.exit(1);
}

const seen = new Map<string, Q>();
let total = 0;
let userCount = 0;
let dropped = 0;

for (const r of rows) {
  total++;
  if (r[iRole] !== "user") continue;
  userCount++;
  let content = (r[iContent] || "").trim();
  // Drop the obvious truncation marker the export uses
  content = content.replace(/\s*\.\.\.\[Truncated\]\s*$/i, "").trim();
  // Collapse whitespace
  content = content.replace(/\s+/g, " ").trim();
  if (content.length < 3 || content.length > 600) {
    dropped++;
    continue;
  }
  // Filter out meaningless noise like single-char or pure punctuation
  if (!/[a-zа-яäöü]/i.test(content)) {
    dropped++;
    continue;
  }
  const langRaw = (r[iLang] || "de").toLowerCase();
  const lang: Lang = langRaw === "en" ? "en" : langRaw === "ru" ? "ru" : "de";
  const key = lang + "|" + content.toLowerCase();
  if (seen.has(key)) continue;
  const sessionShort = (r[iSession] || "").slice(0, 8);
  const ts = (r[iTs] || "").replace(/[^0-9]/g, "").slice(0, 14);
  seen.set(key, {
    id: `prod_${lang}_${sessionShort}_${ts || seen.size}`,
    lang,
    content,
  });
}

const list = [...seen.values()];
const byLang = list.reduce<Record<string, number>>((acc, q) => {
  acc[q.lang] = (acc[q.lang] || 0) + 1;
  return acc;
}, {});

fs.writeFileSync(outPath, JSON.stringify({ questions: list }, null, 2));

console.log(`Parsed: ${total} rows, ${userCount} user messages, ${dropped} dropped, ${list.length} unique questions`);
console.log(`By language:`, byLang);
console.log(`Wrote → ${outPath}`);
console.log(`\nSample (first 15):`);
for (const q of list.slice(0, 15)) {
  console.log(`  [${q.lang}] ${q.content}`);
}
