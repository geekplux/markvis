# bullet

Use to show actual against target for several labels on one scale: quota, budget, SLA. One row per label: `x` label, `y` actual. Optional `target:` names a column of targets; an empty target cell draws no target. Optional `min` / `max` fix the scale; a value past them is drawn to the edge and still labeled with its number. Keep input row order. A repeated label → `E_DUP_KEY`. A target that is not a number → `E_BAD_NUMBER`. A `target` column that does not exist → `E_UNKNOWN_FIELD`.

Do not use for a single reading (`gauge`) or for parts of a whole (`bar` stacked, `pie`). No qualitative bands: put thresholds in the target.
