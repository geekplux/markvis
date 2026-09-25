# sankey

Use for directed flows between nodes. One row = one link: `x` source, `series` target (**required**), `y` flow ≥ 0. Keep input row order. Nodes = unique `x` ∪ `series`. Self-links (`x` value equals `series` value) → `E_UNKNOWN_FIELD`. A cycle → `E_SANKEY_CYCLE`. A repeated source/target pair → `E_DUP_KEY`. Equal values share one thickness. Negatives → `E_NEGATIVE_VALUE`.

Do not use for hierarchical part-to-whole (`treemap`) or ordered stage drop-off (`funnel`).
