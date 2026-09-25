# sankey

Use for directed flows between nodes. One row = one link: `x` source, `series` target (**required**), `y` flow ≥ 0. Keep input row order. Nodes = unique `x` ∪ `series`. Self-links (`x` value equals `series` value) → `E_UNKNOWN_FIELD`. Negatives → `E_NEGATIVE_VALUE`. Cycles are allowed (paint left-to-right columns).

Do not use for hierarchical part-to-whole (`treemap`) or ordered stage drop-off (`funnel`).
