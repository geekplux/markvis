# gauge

Use for a single labeled value (one row). Optional `min` / `max` numbers; omit `min` → 0, omit `max` → 100. Both set ⇒ `min < max` or `E_UNKNOWN_FIELD`. A second row is `E_DUP_KEY`. `series` is ignored.

Do not use for a category comparison (`bar`) or a part-to-whole (`pie`).
