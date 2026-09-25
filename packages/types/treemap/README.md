# treemap

Use for nested area by size. `x` label, `y` value ≥ 0, optional `series` parent. Omit `series` → flat leaves. With `series` → **two levels only** (parent → children). Negatives → `E_NEGATIVE_VALUE`. Rows with `y ≤ 0` stay in the table but are omitted from paint.

Do not use for deeper trees, path strings, or sunburst / circular layouts.
