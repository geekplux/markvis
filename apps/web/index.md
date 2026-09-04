---
layout: home
hero:
  name: markvis
  text: Quantitative charts in Markdown — the fence is the data.
  actions:
    - theme: brand
      text: Open playground
      link: /play
    - theme: alt
      text: Examples
      link: /examples
    - theme: alt
      text: GitHub
      link: https://github.com/geekplux/markvis
---

## Figures

<svg width="240" height="120" viewBox="0 0 240 120" role="img" aria-label="Bar chart placeholder">
  <rect width="240" height="120" fill="#f4f4f5" />
  <text x="120" y="64" text-anchor="middle" fill="#71717a" font-size="14">SVG placeholder</text>
</svg>

<svg width="240" height="120" viewBox="0 0 240 120" role="img" aria-label="Line chart placeholder">
  <rect width="240" height="120" fill="#f4f4f5" />
  <text x="120" y="64" text-anchor="middle" fill="#71717a" font-size="14">SVG placeholder</text>
</svg>

<svg width="240" height="120" viewBox="0 0 240 120" role="img" aria-label="Pie chart placeholder">
  <rect width="240" height="120" fill="#f4f4f5" />
  <text x="120" y="64" text-anchor="middle" fill="#71717a" font-size="14">SVG placeholder</text>
</svg>

## Fence

```chart
markvis: 2
type: bar
title: Feb led Q3 at 180
unit: USD k
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```
