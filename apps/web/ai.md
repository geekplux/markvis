---
title: AI
pageClass: folio-docs
sidebar: true
---

# AI

An agent should write a Markdown code block, not a screenshot. MarkVis draws the chart from that block. No one has to fix the text by hand.

## Fetch this

```
https://markvis.js.org/llms.txt
```

Fetch `/llms.txt`. Emit **only** the fields that file lists. Do not invent keys. Do not invent a type id. Do not emit a PNG or JSON as the default data body.

Skill (optional, same language): [skills/markvis/SKILL.md](https://github.com/geekplux/markvis/blob/master/skills/markvis/SKILL.md)

## Short instruction

Put this in a system prompt, a tool description, or a skill. It is 250 tokens and adds nothing to the language.

````text
Chart numbers as a markvis block, not an image or JSON:

```chart
type: bar
title: Revenue
x: month
y: revenue

month,revenue
Jan,120
Feb,95
```

Fields, a blank line, then CSV or a Markdown table with a header row. x, y, series name columns; unit is optional. Or put <!-- chart: bar x=month y=revenue --> above a Markdown table.

Types: bar line area scatter pie hist heatmap funnel waterfall radar gauge sankey treemap dumbbell bullet boxplot calendar.

Several series: a row per x and series, plus series:. Keep row order. Donut: pie, innerRadius: 0.5. Stacked: layout: stacked. No other types or fields.
````

With this instruction, each of four models gave a valid block for 29 or 30 of the 30 prompts in `examples/prompts.md`, in two runs, and chose the expected chart type for 29 or 30 of them. With no instruction, only told that the app draws markvis blocks, the same models gave 0 to 2 valid blocks: most wrote JSON or invented fields. Details: [docs/prompt.md](https://github.com/geekplux/markvis/blob/master/docs/prompt.md).

## What to emit

A fenced code block tagged `chart` / `markvis` / `vis` — one language. Types: `bar` `line` `area` `scatter` `pie` `hist` `heatmap` `funnel` `waterfall` `radar` `gauge` `sankey` `treemap` `dumbbell` `bullet` `boxplot` `calendar`.

Order inside the block:

1. Optional `markvis: 2`
2. One `key: value` per line. `type` is required. Every other field must be one listed in `/llms.txt`.
3. Blank line
4. Comma-separated rows, or one Markdown table — not JSON

## Prefer

- A table of numbers (CSV or a Markdown table)
- Keep row order; do not force pie slices to 100
- On error: table plus one line with the stable error code

## Avoid

- A flowchart tool for spreadsheet numbers
- An invented type id
- Silent sort of the categories
- Fields not listed in `/llms.txt`

Eval pairs: `examples/prompts.md` in the repo.
