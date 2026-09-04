# Best practices

Human contrib rules for markvis 2.0. SPEC.md and CONSTITUTION.md win on conflict.

## Do

1. **Fixtures first.** Add or change an examples/valid or examples/invalid fixture before touching parser or render. Invalid cases need a stable error code.
2. **Keep the six types.** bar, line, area, scatter, pie, hist only. New chart kinds need a product decision, not a PR.
3. **CSV or GFM data.** Prefer tables over JSON. Keep input row order. Do not normalize pie to 100.
