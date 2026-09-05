---
layout: home
hero:
  name: markvis
  text: Charts in Markdown. The fence is the data.
  actions:
    - theme: brand
      text: Playground
      link: /play
    - theme: alt
      text: Examples
      link: /examples
---

![Feb led Q3](/home/01-bar-basic.svg)

![Pro pulled ahead](/home/02-line-multi.svg)

![Shares stay raw](/home/05-pie-raw.svg)

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

0.0.13 is frozen under legacy/. The site ships from branch v2.
