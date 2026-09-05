# Show HN draft

Do not post. Hand to GeekPlux.

**Title:** Markvis — charts in Markdown (the fence is the data)

**Text:**

I rebuilt markvis for the AI / README era. You write a chart as a Markdown fence or GFM table. That table is the source of truth. It renders deterministic SVG (same input, same bytes). If the host has no plugin, readers still see the numbers.

Six types: bar, line, area, scatter, pie, hist. Optional looks via a theme header (folio default, plus highcharts / shadcn / docs token packs — no heavy chart libs in core).

Try: https://markvis.js.org/ and https://markvis.js.org/examples.html

GitHub READMEs: bake images into the file. Or drop in markvis.min.js. remark / markdown-it adapters included.

Branch v2. The old 0.0.13 tree stays under legacy/.
