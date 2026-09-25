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

## What to emit

A fenced code block tagged `chart` / `markvis` / `vis` — one language. Types: `bar` `line` `area` `scatter` `pie` `hist` `heatmap` `funnel` `waterfall` `radar` `gauge` `sankey` `treemap`.

Order inside the block:

1. Optional `markvis: 2`
2. One `key: value` per line (`type` required; `title` `theme` `unit` `x` `y` `series` as listed in `/llms.txt`)
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
