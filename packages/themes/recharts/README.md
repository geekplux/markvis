# recharts theme

Static SVG grammar inspired by Recharts demos — without the `recharts` npm package.

## Steal
- Dashed Cartesian grid in x and y (`GRID: { dash: "3 3", axes: "xy" }`)
- Both axis lines with 6px ticks (`AXIS: { line: "xy", tick: 6 }`)
- Monotone curves with hollow points (`LINE_CURVE: "monotone"`, `MARKER: "hollow"`)
- Legend **below** the plot, centered; scatter rings
- Square bars (`BAR_RX: 0`), system UI face
- Classic categorical blues / greens / oranges

## Don't steal
- `recharts` npm / vendor runtime
- Opaque plot wallpaper (U6: transparent fill)
- HC denser-horiz-only grid or shadcn sparse card look
- Axis field titles

Fence id: `recharts`.
