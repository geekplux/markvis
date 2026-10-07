# boxplot

Use to compare distributions across categories from raw observations: latency per service, scores per class. One row = one observation: `x` category, `y` number. Repeated categories are the point. Optional `series` puts one box per series inside each category. Keep category order as first seen. Quartiles use linear interpolation (type 7, as numpy, R, and Excel `QUARTILE.INC`). Whiskers reach the furthest observations inside 1.5 × IQR; the rest are hollow outlier dots. A group with fewer than five values shows its points and a median tick, not a box. An empty `y` is skipped. Negatives are fine.

Do not use for one number per category (`bar`) or for a single distribution's shape in detail (`hist`).
