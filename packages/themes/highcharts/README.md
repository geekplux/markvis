# highcharts theme

Static SVG grammar that reads like Highcharts demos — without Highcharts.

## Steal
- Default series blues/greys/greens, with Highcharts' dark-theme hues on `surface: dark`
- Lucida Grande / Arial labels, bold legend and value labels
- Centered 18/400 title with the unit as a subtitle (`TITLE.align: "middle"`, `TITLE.unit: "subtitle"`)
- Tick marks on the category axis (`AXIS.tick: 6`) and axis titles
- Square bars (`BAR_RX: 0`), filled line markers (`LINE_POINT_R: 4`)
- Circle legend keys centered under the plot

## Don't steal
- Highcharts JS runtime, modules, or license
- Opaque plot wallpaper (U6: transparent fill)
- Exporting chrome
- Chart types Markvis does not have
