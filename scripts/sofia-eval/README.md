# Sofia Eval Harness

Automated regression tests for the Sofia recruiting prompt
(`MARIA_RECRUITING_PROMPT_DE/EN/RU` in `server/integrations/maria-chat.ts`).

## What it does

Three test sources are run against the live prompt:

1. **personas.json** — multi-turn role-play. A second LLM plays the visitor
   (skeptic, busy investor, newbie, team-builder, off-topic, …); Sofia replies.
2. **scenarios.json** — single-intent scripted asks (presentation, register,
   ROI, risk, broker, off-topic jokes, …) in DE/EN/RU.
3. **Real user questions** — by default loaded from
   `scripts/sofia-eval/real-questions-prod.json` (extracted from a production
   `chat-sessions.csv` export with `extract-prod-questions.ts`). If that
   file is absent, falls back to the local `chat_messages` table. Each
   unique user message becomes a one-shot scenario. Disable with `--no-real`,
   set sample size with `--real-limit N`, fix the random sample with
   `--real-seed <string>`.

   To refresh the prod question set:
   ```bash
   tsx scripts/sofia-eval/extract-prod-questions.ts attached_assets/chat-sessions.csv
   ```

A judge LLM scores each transcript against a fixed rubric (introduces as
Sofia, never says Maria, language consistency, has CTA, on-topic, warm tone,
max-35-words, no digits, no symbols, objection handling). Results are written
to `exports/sofia-evals/<runId>/`.

## Running

Run via `tsx` directly (no npm script — `package.json` is environment-managed):

```bash
# Full run (personas + scenarios + 30 real questions)
tsx scripts/sofia-eval/run.ts

# Only synthetic, no DB:
tsx scripts/sofia-eval/run.ts --no-real

# Only one language:
tsx scripts/sofia-eval/run.ts --lang de

# More real questions:
tsx scripts/sofia-eval/run.ts --real-limit 80

# Personas only / scenarios only:
tsx scripts/sofia-eval/run.ts --personas-only
tsx scripts/sofia-eval/run.ts --scenarios-only

# Use a stronger model for Sofia (more accurate baseline):
tsx scripts/sofia-eval/run.ts --sofia gpt-4o --judge gpt-4o
```

## Output

```
exports/sofia-evals/<YYYYMMDD-HHMMSS>/
├── meta.json              # prompt hash + run config
├── report.json            # machine-readable per-case scores
├── report.md              # summary table sorted by score (worst first)
└── transcripts/
    ├── skeptic_mlm_de.md
    ├── presentation_de.md
    └── real_1234.md
```

## Diffing two runs

After editing the prompt, re-run and compare:

```bash
tsx scripts/sofia-eval/run.ts                              # produces e.g. 20260423-141530
# ...edit MARIA_RECRUITING_PROMPT_DE...
tsx scripts/sofia-eval/run.ts                              # produces e.g. 20260423-145812
tsx scripts/sofia-eval/diff.ts 20260423-141530 20260423-145812
```

The diff prints per-case score deltas and writes
`exports/sofia-evals/<new>/diff-vs-<baseline>.md`.

## Cost

A full run is ~80 cases × ~6 LLM calls × `gpt-4o-mini` ≈ a few US cents.
With `--sofia gpt-4o --judge gpt-4o` it's ~$0.50–1.

## Notes

- The harness calls OpenAI directly with the same prompt the server uses
  (imported from `server/integrations/maria-chat.ts`), so it tests exactly
  what production serves. No HTTP server required.
- Real-question fetching uses the project's Drizzle `db` connection;
  `DATABASE_URL` must be set (it normally is in this Repl).
- Transcripts and reports are intentionally written as plain Markdown so
  they're easy to skim and review in PRs.
