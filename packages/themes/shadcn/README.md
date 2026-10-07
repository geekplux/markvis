# shadcn

Static SVG grammar: a card with a title and muted description, no axis line, smooth lines, rounded marks, chart-1..5 hues. Tokens only — no shadcn/ui or Recharts.

## Steal
- `--chart-1..5` categorical hues, and the dark-mode set on `surface: dark`
- Geist / Inter type; title over a muted description (`TITLE.unit: "subtitle"`)
- Card outline with a 12px radius (`FRAME`)
- No axis line or ticks (`AXIS.line: "none"`), quiet hairline grid
- Monotone curves without point marks (`LINE_CURVE`, `MARKER: "none"`)
- Rounded bars (`BAR_RX: 8`) and rounded legend keys centered below

## Don't steal
- shadcn/ui or Recharts runtime
- Highcharts plot border `#ccd6eb` / Arial demo look
- Folio blue-first palette
- Loud grid or axis field titles
- Opaque plot wallpaper (U6: transparent fill)

See `docs/themes.md`.
