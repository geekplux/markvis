# Model instruction

Give a model this text, in a system prompt, a tool description, or a skill, and it writes markvis blocks. It is 250 tokens and a subset of `SPEC.md`: it adds no field or type.

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

## Measured

With this instruction, each of four models gave a valid block for 29 or 30 of the 30 prompts in `examples/prompts.md`, in two runs, and chose the expected chart type for 29 or 30 of them. With no instruction, only told that the app draws markvis blocks, the same models gave 0 to 2 valid blocks: most wrote JSON or invented fields.

## Score your own model

Ask your model each prompt in `examples/prompts.md`, save one answer per prompt as `01.md` … `30.md`, and run:

```bash
pnpm eval-prompts --outputs path/to/answers
```

For each answer it reads the first chart block and prints whether it parses, its error code, and whether its type matches the expected one, then the totals. It exits non-zero when any answer has no valid block. Known mistakes and their fixes are in `docs/model-errors.md`.
