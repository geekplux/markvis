# AI

Give an agent a fence it can edit — not a PNG it cannot.

Agents should emit a markvis fence (chart / markvis / vis), never a flowchart DSL, never a PNG, never Vega JSON as the default. Types: bar, line, area, scatter, pie, hist.

## Trigger

Use when the user wants a chart in Markdown from tabular data.

Skill: https://github.com/geekplux/markvis/blob/v2/skills/markvis/SKILL.md  
Brief: https://github.com/geekplux/markvis/blob/v2/llms.txt

## Prefer

- CSV or GFM table
- Keep row order; do not force pie to 100
- Invalid: table plus one error line

## Avoid

- Flowchart tools for spreadsheet numbers
- A seventh chart type
- Silent x-sort

Eval pairs: examples/prompts.md
