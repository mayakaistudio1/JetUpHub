/**
 * Diff two Sofia eval runs by report.json. Usage:
 *   tsx scripts/sofia-eval/diff.ts <baseline-runId> <new-runId>
 */
import fs from "node:fs";
import path from "node:path";

const [baselineId, newId] = process.argv.slice(2);
if (!baselineId || !newId) {
  console.error("Usage: tsx scripts/sofia-eval/diff.ts <baseline> <new>");
  process.exit(1);
}

function load(id: string) {
  const p = path.resolve(process.cwd(), "exports", "sofia-evals", id, "report.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as Array<{
    caseId: string;
    judge: { overall_score: number; notes: string };
  }>;
}

const a = load(baselineId);
const b = load(newId);
const aMap = new Map(a.map((c) => [c.caseId, c.judge.overall_score]));
const bMap = new Map(b.map((c) => [c.caseId, c.judge.overall_score]));
const all = new Set([...aMap.keys(), ...bMap.keys()]);

const rows: { caseId: string; before: number | null; after: number | null; delta: number }[] = [];
for (const id of all) {
  const before = aMap.get(id) ?? null;
  const after = bMap.get(id) ?? null;
  const delta = (after ?? 0) - (before ?? 0);
  rows.push({ caseId: id, before, after, delta });
}
rows.sort((x, y) => x.delta - y.delta);

const avgA = a.reduce((s, c) => s + c.judge.overall_score, 0) / Math.max(1, a.length);
const avgB = b.reduce((s, c) => s + c.judge.overall_score, 0) / Math.max(1, b.length);

console.log(`Baseline ${baselineId}: avg ${avgA.toFixed(2)} (n=${a.length})`);
console.log(`New      ${newId}: avg ${avgB.toFixed(2)} (n=${b.length})`);
console.log(`Δ avg: ${(avgB - avgA).toFixed(2)}\n`);

console.log("Case | Before | After | Δ");
console.log("-----|--------|-------|---");
for (const r of rows) {
  const sign = r.delta > 0 ? "+" : "";
  console.log(`${r.caseId} | ${r.before ?? "-"} | ${r.after ?? "-"} | ${sign}${r.delta}`);
}

const outPath = path.resolve(
  process.cwd(),
  "exports",
  "sofia-evals",
  newId,
  `diff-vs-${baselineId}.md`,
);
const md = [
  `# Sofia Eval Diff: ${baselineId} → ${newId}`,
  "",
  `- Baseline avg: **${avgA.toFixed(2)}** (n=${a.length})`,
  `- New avg: **${avgB.toFixed(2)}** (n=${b.length})`,
  `- Δ: **${(avgB - avgA).toFixed(2)}**`,
  "",
  "| Case | Before | After | Δ |",
  "|---|---|---|---|",
  ...rows.map((r) => `| ${r.caseId} | ${r.before ?? "-"} | ${r.after ?? "-"} | ${r.delta > 0 ? "+" : ""}${r.delta} |`),
].join("\n");
fs.writeFileSync(outPath, md);
console.log(`\nWrote ${outPath}`);
