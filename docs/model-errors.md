# Model errors

Failures from agents emitting markvis. Append rows when `scripts/eval-prompts` or reviews catch a miss.

| When | Mistake | Expected | Error / fix |
| --- | --- | --- | --- |
| (seed) | Mermaid `pie` for a CSV | markvis `type: pie` fence | Use markvis; Mermaid is structure |
| (seed) | JSON array as data body | CSV or GFM table | `E_JSON_DATA` |
| (seed) | `type: donut` / `heatmap` | one of the six | `E_UNKNOWN_TYPE` |
| (seed) | Pie values forced to sum 100 | leave raw values | Do not normalize |
| (seed) | Categories sorted A–Z | input row order | Never silent x-sort |
