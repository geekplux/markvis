# gauge

Use for a single labeled value (first data row). Optional `min` / `max` numbers; omit `min` → 0, omit `max` → `max(y, 1)`. Both set ⇒ `min < max` or `E_UNKNOWN_FIELD`. `series` is ignored.

Do not use for a category comparison (`bar`) or a part-to-whole (`pie`).
