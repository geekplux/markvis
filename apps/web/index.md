---
layout: page
sidebar: false
aside: false
title: markvis
pageClass: folio-home-page
---

<div class="folio-home">

<section class="folio-hero">
<p class="folio-mark">markvis</p>
<p class="folio-lede">Charts in Markdown. The fence is the data.</p>
<p class="folio-actions">
  <a class="folio-btn primary" href="/play">Playground</a>
  <a class="folio-btn secondary" href="/examples">Examples</a>
</p>
</section>

<section class="folio-section folio-what" aria-labelledby="folio-what-h">
<h2 id="folio-what-h" class="folio-h2">What it does</h2>
<ul class="folio-bullets">
  <li>The fence (or GFM table) is the source — the rows stay in the file.</li>
  <li>Same input yields the same SVG.</li>
  <li>No plugin still shows the table, so readers never lose the numbers.</li>
</ul>
</section>

<section class="folio-section folio-who" aria-labelledby="folio-who-h">
<h2 id="folio-who-h" class="folio-h2">Who it helps</h2>
<div class="folio-cards">
  <article class="folio-card">
    <h3 class="folio-card-title">README / post authors</h3>
    <p class="folio-card-body">figures without uploading a PNG that drifts from the data.</p>
  </article>
  <article class="folio-card">
    <h3 class="folio-card-title">Agent-written Markdown</h3>
    <p class="folio-card-body">edit a row, redraw the chart; the agent never paints pixels.</p>
  </article>
  <article class="folio-card">
    <h3 class="folio-card-title">No-screenshot workflows</h3>
    <p class="folio-card-body">refuse a bitmap as the source of truth.</p>
  </article>
</div>
</section>

<section class="folio-section folio-proof" aria-labelledby="folio-proof-h">
<h2 id="folio-proof-h" class="folio-h2">Proof</h2>
<div class="folio-figures">
  <figure>
    <img src="/home/01-bar-basic.svg" alt="Bar chart: Feb led Q3" />
    <figcaption>Feb led Q3</figcaption>
  </figure>
  <figure>
    <img src="/home/02-line-multi.svg" alt="Line chart: Pro pulled ahead" />
    <figcaption>Pro pulled ahead</figcaption>
  </figure>
  <figure>
    <img src="/home/05-pie-raw.svg" alt="Pie chart: Shares stay raw" />
    <figcaption>Shares stay raw</figcaption>
  </figure>
</div>
</section>

<section class="folio-section folio-start" aria-labelledby="folio-start-h">
<h2 id="folio-start-h" class="folio-h2">30-second start</h2>
<ol class="folio-steps">
  <li>Open <a href="/play">Playground</a> — paste a fence or pick an example.</li>
  <li>Or bake a README: <code>markvis bake README.md</code> (keeps the fence, inserts the image).</li>
</ol>

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

</section>

<section class="folio-section folio-use" aria-labelledby="folio-use-h">
<h2 id="folio-use-h" class="folio-h2">Use it</h2>

| Where | How |
| --- | --- |
| GitHub README | `markvis bake` — images show with no JS |
| Any page | `markvis.min.js` (zero network) |
| remark | `@markvis/remark` |
| markdown-it | `@markvis/markdown-it` |

</section>

<section class="folio-section folio-themes" aria-labelledby="folio-themes-h">
<h2 id="folio-themes-h" class="folio-h2">Themes</h2>
<p class="folio-themes-line">Four looks via a fence header (<code>folio</code> default): folio · highcharts · shadcn · docs — try them on <a href="/examples">Examples</a>.</p>
</section>

<footer class="folio-foot">
MIT · <a href="https://github.com/geekplux/markvis">GitHub</a> · 0.0.13 frozen under <code>legacy/</code> · site from branch <code>v2</code>
</footer>

</div>
