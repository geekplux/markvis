# Best practices

Human contrib rules for markvis 2.0. SPEC.md and CONSTITUTION.md win on conflict.

## Do

1. **Fixtures first.** Add or change an examples/valid or examples/invalid fixture before touching parser or render. Invalid cases need a stable error code.
2. **Keep the six types.** bar, line, area, scatter, pie, hist only. New chart kinds need a product decision, not a PR.
3. **CSV or GFM data.** Prefer tables over JSON. Keep input row order. Do not normalize pie to 100.
4. **Prove with commands.** Same local suite CI runs (install, test, check fixtures, playground build when UI moves).
5. **Read AGENTS.md** before opening a PR. Language tags and header fields are frozen.

## Do not

- Add forbidden render deps under packages/ or apps/ (see AGENTS.md allow/forbid list).
- Invent a 7th type, silent x-sort, or JSON-as-default data.
- Drop recovered rows on invalid fences (table + one-line error).
- Import legacy/ from new package tests.
- Treat Mermaid as the path for spreadsheet numbers.

## Docs touchpoints

| Change | Also update |
| --- | --- |
| New valid/invalid fence | examples/ + tests that read it |
| Agent failure pattern | docs/model-errors.md |
| Prompt to fence pair | examples/prompts.md + eval-prompts script |
| Architecture call | DECISIONS.tsv one line |

Landing copy lives in docs/landing.md (W12). Skill trigger text lives in skills/markvis/SKILL.md.
