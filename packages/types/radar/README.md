# radar

Use for named spokes with a non-negative score (`y ≥ 0`). Keep spoke order. Optional `series` draws one polygon per series. Scale max is `max(y)` (or 1 if all values are 0). Negatives fail with `E_NEGATIVE_VALUE`.

Do not use for a single linear comparison (`bar`) or a time series (`line`).
