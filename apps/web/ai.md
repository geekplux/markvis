# AI

Agents should emit a markvis fence, not Mermaid pie, not a PNG, not Vega JSON as the default.

## Trigger

Use for quantitative charts in Markdown from tabular data. Tags: chart / markvis / vis. Types: bar, line, area, scatter, pie, hist.

Skill: https://github.com/geekplux/markvis/blob/v2/skills/markvis/SKILL.md
Brief: https://github.com/geekplux/markvis/blob/v2/llms.txt

## Prefer

- CSV or GFM table
- Keep row order; do not force pie to 100
- Invalid: table plus one error line

## Avoid

- Mermaid for spreadsheet numbers
- A seventh chart type
- Silent x-sort

Eval pairs: examples/prompts.md
