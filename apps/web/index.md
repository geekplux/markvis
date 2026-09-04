---
layout: home
hero:
  name: markvis
  text: Quantitative charts in Markdown. Mermaid is structure; markvis is numbers.
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

## Proof

![Feb led Q3](/home/01-bar-basic.svg)

![Pro pulled ahead](/home/02-line-multi.svg)

![Shares stay raw](/home/05-pie-raw.svg)

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

0.0.13 is frozen under `legacy/`. Work and the site ship from branch `v2`.
