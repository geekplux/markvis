# calendar

Use for a value per day where the weekly and seasonal rhythm matters: commits, steps, sales, incidents. One row = one day: `x` is a `YYYY-MM-DD` date, `y` a number. Weeks run left to right, Monday to Sunday top to bottom, one band per year. Position comes from the date, so row order does not matter. A day absent from the table is a faint empty cell; a day with an empty value is hatched as missing, never drawn as zero. Optional `min` / `max` fix the color domain so several calendars compare. A malformed or impossible date (`2026-02-30`) → `E_BAD_DATE`. A repeated date → `E_DUP_KEY`. `series` is ignored.

Do not use for a few points in time (`line`) or for categories that are not days (`heatmap`).
