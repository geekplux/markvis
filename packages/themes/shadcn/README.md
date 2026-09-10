# shadcn

Static SVG grammar: rounded marks, chart-1..5 hues, card-quiet axes, soft `#e5e5e5` plot border, legend for series ≥ 2, sparse grid. Tokens only — no shadcn/ui or Recharts.

## Steal
- `--chart-1..5` categorical hues
- Inter-first type
- `BAR_RX: 6` rounded bar tops
- Soft hairline / structure (`0.06` / `0.14`)
- Card border `#e5e5e5` + white plot fill
- Color legend when series ≥ 2

## Don't steal
- shadcn/ui or Recharts runtime
- Highcharts plot border `#ccd6eb` / Arial demo look
- Folio blue-first palette
- Loud grid or axis field titles
- Hover/tooltip (later unit)

See `docs/themes.md`.
