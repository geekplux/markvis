# radar

Use for named spokes with a non-negative score (`y ≥ 0`). Keep spoke order. Optional `series` draws one polygon per series on one scale (`max` if it is at least the data max, otherwise `max(y)` or 1). A `max` below the data expands the scale so a spoke is not clipped. A missing spoke is a gap. A grouped bar is clearer when the reader needs the exact number. Negatives fail with `E_NEGATIVE_VALUE`.

Do not use for a single linear comparison (`bar`) or a time series (`line`).
