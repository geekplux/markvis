# Best practices

Human contrib rules for markvis. SPEC.md, VISION.md, and AGENTS.md are the public contract. Do not treat process ledgers as product law.

## Do

1. **Fixtures first.** Add or change an examples/valid or examples/invalid fixture before touching parser or render. Invalid cases need a stable error code.
2. **Keep the type catalog.** bar, line, area, scatter, pie, hist, heatmap, funnel, waterfall, radar, gauge. New chart kinds need a product decision, not a PR.
3. **CSV or GFM data.** Prefer tables over JSON. Keep input row order. Do not normalize pie to 100.
4. **Prove with commands.** Same local suite CI runs (install, build, test, check fixtures, playground build when UI moves).
5. **Read AGENTS.md** before opening a PR. Language tags and the type catalog are frozen. Optional `theme:` (grammar) and `palette:` (colors) follow `SPEC.md`.

## Do not

- Add forbidden render deps under packages/ or apps/ (see AGENTS.md allow/forbid list).
- Invent `donut` / `sankey` / `treemap` / stacked-bar as type ids, silent x-sort, or JSON-as-default data.
- Drop recovered rows on invalid fences (table + one-line error).
- Import legacy/ from new package tests.
- Use a flowchart tool for flows — not for spreadsheet numbers.

## Docs touchpoints

| Change | Also update |
| --- | --- |
| New valid/invalid fence | `examples/` + tests that read it + `docs/examples.md` when the gallery story changes |
| Agent failure pattern | `docs/model-errors.md` |
| Prompt to fence pair | `examples/prompts.md` + eval-prompts script |
| Architecture call | `docs/architecture.md` |
| Theme / palette tokens | `docs/themes.md` + `packages/themes/` |
| Ledger / folio look | `docs/visual-spec.md` |
| Public site chrome or home copy | `docs/site.md` + `apps/web/` |

Landing copy lives in `docs/landing.md`. Skill trigger text lives in `skills/markvis/SKILL.md`. Committed repo text is English only (`AGENTS.md`).
