---
layout: page
sidebar: false
aside: false
title: markvis
pageClass: folio-home-page
---

<div class="folio-home">

<p class="folio-mark">markvis</p>

<p class="folio-lede">Charts in Markdown. The fence is the data.</p>

<p class="folio-actions">
  <a class="folio-btn primary" href="/play">Playground</a>
  <a class="folio-btn secondary" href="/examples">Examples</a>
</p>

<div class="folio-figures">
  <figure>
    <img src="/home/01-bar-basic.svg" alt="Feb led Q3 at 180" />
  </figure>
  <figure>
    <img src="/home/02-line-multi.svg" alt="Pro pulled ahead" />
  </figure>
  <figure>
    <img src="/home/05-pie-raw.svg" alt="Shares stay raw" />
  </figure>
</div>

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

<p class="folio-foot">0.0.13 is frozen under legacy/. The site ships from branch v2.</p>

</div>
