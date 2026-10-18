# Model errors

Failures from agents emitting markvis. Append rows when `scripts/eval-prompts` or reviews catch a miss.

| When | Mistake | Expected | Error / fix |
| --- | --- | --- | --- |
| (seed) | Flowchart-DSL pie for a CSV | markvis `type: pie` fence | Use a markvis fence; leave flow DSLs for structure |
| (seed) | JSON array as data body | CSV or GFM table | `E_JSON_DATA` |
| (seed) | `type: donut` / `sunburst` / `chord` | one of the 17 types | `E_UNKNOWN_TYPE` |
| (seed) | Pie values forced to sum 100 | leave raw values | Do not normalize |
| (seed) | Categories sorted A–Z | input row order | Never silent x-sort |
| eval, no instruction | Whole block as a JSON object (`{"type": "bar", "data": [...]}`) | header lines, blank line, CSV | `E_JSON_DATA`; give the model `docs/prompt.md` |
| eval, no instruction | Rows as a `data:` list inside the header | CSV or a Markdown table after a blank line | `E_UNKNOWN_FIELD` |
| eval, no instruction | Invented fields `xLabel`, `yLabel`, `labels` | `x`, `y`, `series` name columns; the column name is the axis label | `E_UNKNOWN_FIELD` |
| eval, no instruction | `type: histogram` | `type: hist` | `E_UNKNOWN_TYPE` |
| eval, with instruction | `name:` / `value:` instead of `x:` / `y:` on a pie | `x: name`, `y: value` | `E_UNKNOWN_FIELD` |
| eval, with instruction | A row with a missing comma, then "let me fix that" and a second block | rewrite the one block; do not leave the broken one above it | `E_EXTRA_COLUMN` on the first block |
| eval, with instruction | Asked for the comment form, answered with a plain Markdown table | `<!-- chart: bar x=month y=revenue -->` on the line above the table | No chart; the table still shows |
