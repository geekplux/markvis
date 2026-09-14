# recharts theme

Static SVG grammar inspired by Recharts demos — without the `recharts` npm package.

## Steal
- Cartesian XY grid (horizontal + vertical lines; `VERTICAL_GRID: true`)
- Legend **below** the plot for multi-series (`LEGEND_BELOW: true`, `END_LABEL_SERIES_MAX: 0`)
- Stroke `2`, markers `r=3`, square bars (`BAR_RX: 0`)
- Light plot border `#e2e8f0` stroke-only (transparent fill)
- System UI face (folio stack)
- Classic categorical blues / greens / oranges

## Don't steal
- `recharts` npm / vendor runtime
- Opaque plot wallpaper (U6: transparent fill)
- HC denser-horiz-only grid or shadcn sparse card look
- Axis field titles

Fence id: `recharts`.
