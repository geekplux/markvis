# highcharts theme

Static SVG grammar that reads like Highcharts demos — without Highcharts.

## Steal
- Default series blues/greys/greens
- Arial / Helvetica labels
- Plot border `#ccd6eb` stroke-only (transparent fill)
- Denser grid (`MAX_INTERIOR_GRID: 5`, hairline `0.22`)
- Square bars (`BAR_RX: 0`)
- Line markers (`LINE_POINT_R: 3.5`)
- Color legend whenever series ≥ 2 (`END_LABEL_SERIES_MAX: 0`)
- Axis titles from IR `x` / `y` / `unit` when present
- Legend-friendly margins

## Don't steal
- Highcharts JS runtime, modules, or license
- Opaque plot wallpaper (U6: transparent fill; stroke-only border)
- Exporting chrome
- Chart types Markvis does not have
