# dumbbell

Use to compare two values per category on one scale: before and after, plan and actual, two years. One row = one value: `x` category, `series` names the pair (**required**, exactly two values; the first seen is "from", the second "to"), `y` number. Keep input row order. The first value is a hollow dot, the second a filled dot, and the signed change prints at the right. A missing value leaves one dot and no rule. A repeated category/series pair → `E_DUP_KEY`. A third series value → `E_UNKNOWN_FIELD`. Negatives are fine.

Do not use for more than two values per category (`bar` grouped or `line`) or for a single value (`bar`).
