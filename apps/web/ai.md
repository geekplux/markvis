---
title: AI
pageClass: folio-docs
sidebar: true
---

# AI

An agent finds the brief, emits a fence, and gets a figure. No human fixes the text. Not a PNG.

## Fetch this

```
https://markvis.js.org/llms.txt
```

Fetch `/llms.txt`. Emit **only** the fields that file lists. Do not invent keys. Do not add a seventh type. Do not emit a PNG or JSON as the default data body.

Skill (optional, same language): [skills/markvis/SKILL.md](https://github.com/geekplux/markvis/blob/v2/skills/markvis/SKILL.md)

## What to emit

Tags `chart` / `markvis` / `vis` — one language. Types: `bar` `line` `area` `scatter` `pie` `hist`.

Order inside the fence:

1. Optional `markvis: 2`
2. One `key: value` per line (`type` required; `title` `theme` `unit` `x` `y` `series` as listed in `/llms.txt`)
3. Blank line
4. CSV or one GFM table — not JSON

## Prefer

- CSV or GFM table
- Keep row order; do not force pie slices to 100
- On error: table plus one line with the stable error code

## Avoid

- Flowchart tools for spreadsheet numbers
- A seventh chart type
- Silent x-sort
- Fields not listed in `/llms.txt`

Eval pairs: `examples/prompts.md` in the repo.
