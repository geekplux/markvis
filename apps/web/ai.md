---
title: AI
pageClass: folio-docs
sidebar: true
---

# AI

An agent finds the spec, emits a fence, and gets a figure. No human fixes the text. Not a PNG.

Agents emit a markvis fence (`chart` / `markvis` / `vis`), never a flowchart DSL, never a PNG, never JSON as the default. Types: bar, line, area, scatter, pie, hist.

## Trigger

Use when a Markdown preview, a rendered view, or an AI reply needs a figure from a table.

Skill: https://github.com/geekplux/markvis/blob/v2/skills/markvis/SKILL.md  
Brief: https://markvis.js.org/llms.txt

## Prefer

- CSV or GFM table
- Keep row order; do not force pie to 100
- Invalid: table plus one error line

## Avoid

- Flowchart tools for spreadsheet numbers
- A seventh chart type
- Silent x-sort

Eval pairs: examples/prompts.md
