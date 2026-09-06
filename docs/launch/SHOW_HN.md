# Show HN draft

Do not post. Hand to GeekPlux.

## Title

Markvis — charts in Markdown (the fence is the data)

## First comment

I rebuilt markvis so a chart lives in the same Markdown file as the numbers.

Pain today: README authors upload a PNG, the data drifts, and agents cannot edit a figure. Status quo is screenshot, skip the chart, or depend on a host plugin that vanishes in plain Markdown.

markvis: write a fence or a GFM table → deterministic SVG. No plugin still shows the table. Same fence, same bytes. Six types (bar line area scatter pie hist). Optional theme header: folio (default), highcharts, shadcn, docs — token packs, no heavy chart libs in core.

Try: https://markvis.js.org/play · gallery: https://markvis.js.org/examples.html · bake for GitHub READMEs.

Branch v2. Old 0.0.13 stays under legacy/. Happy to take fences that look wrong.

## Three fences (copy-paste)

### Bar

```chart
markvis: 2
type: bar
title: February led Q3
unit: USD k
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```

### Line

```chart
type: line
title: Pro pulled ahead of free
x: month
y: count
series: plan

month,plan,count
Jan,free,40
Jan,pro,12
Feb,free,55
Feb,pro,18
```

### Pie

```chart
type: pie
title: Shares stay raw (not forced to 100)
x: name
y: value

name,value
A,40
B,35
C,30
```
