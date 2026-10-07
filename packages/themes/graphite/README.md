# graphite theme

Editorial mono: charcoal on warm paper, with no hue. Lightness carries the order of the series, and one accent marks the largest value.

## Steal
- Seven-step gray ladder, darkest first (`PALETTE`), reversed on `surface: dark`
- One accent on the largest value of a single-series bar, hist, or pie (`HERO: { rule: "max" }`). A fence `palette:` turns it off.
- Tight bold title (`19/700`, tracking `-0.02em`) over a quiet subtitle unit
- Heavy value numbers (`800`) and small semibold ticks (`600`)
- Hairline `0.5px` grid, ink baseline, no ticks
- Pill-capped bars (`BAR_RX: 999`, clamped to half the bar width), no point markers
- Donut pie (`0.6`) with slices cut apart by the paper color
- `surface: export` is a warm paper card with a 24px radius

## Don't steal
- A second accent: the accent marks one value or none
- Hue to separate series; use the ladder or a `palette:`
- Opaque paper on the light surface (the host page is the paper)

Inspired by the editorial mono style of [lieflat-charts](https://github.com/larashero3-dotcom/lieflat-charts). No code, files, or token tables were copied; the values here are markvis' own.

Fence id: `graphite`.
