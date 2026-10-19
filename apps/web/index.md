---
layout: page
sidebar: false
aside: false
title: MarkVis
pageClass: folio-home-page
---

<div class="home-root">

<main>
<div class="site-rail">

<section id="hero" class="home-hero">
  <p class="home-badge">
    <span class="home-badge-left">MARKVIS 2</span>
    <span class="home-badge-right">CHARTS AS TEXT</span>
  </p>
  <h1 class="home-headline">Charts as text in Markdown.</h1>
  <p class="home-sub">Write a short chart block. markvis draws it as plain SVG wherever Markdown is rendered. Where it cannot draw, the numbers stay as a table.</p>
  <p class="home-cta">
    <a class="home-btn filled" href="#use">Get started</a>
    <a class="home-btn outline" href="https://github.com/geekplux/markvis" target="_blank" rel="noreferrer">GitHub <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
  </p>
  <HeroStage>
  <p class="home-numbers">56 kB gzip · 0 dependencies · under 1 ms a chart · plain SVG</p>
  </HeroStage>
</section>

<section id="use">
  <div class="home-section-head">
    <h2>Use it</h2>
    <p>Four ways in. <a href="/integrate">All of them</a> draw the same chart.</p>
  </div>
  <div class="home-grid home-quick-grid">
    <article class="home-quick">
      <div class="home-quick-title"><span>01</span><h3>One script tag</h3></div>
      <pre class="home-quick-code">&lt;script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"&gt;&lt;/script&gt;</pre>
      <p>In a page or a Markdown file. Every chart block draws. <a class="home-quick-more" href="/integrate#script-tag">more →</a></p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>02</span><h3>JavaScript</h3></div>
      <pre class="home-quick-code">import { render } from "markvis";
el.innerHTML = render(block).html;</pre>
      <p>One call. It never throws. <a class="home-quick-more" href="/integrate#javascript">more →</a></p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>03</span><h3>React</h3></div>
      <pre class="home-quick-code">import { Markvis } from "markvis/react";
&lt;Markvis source={block} /&gt;</pre>
      <p>Follows its container. Streams in react-markdown. <a class="home-quick-more" href="/integrate#react">more →</a></p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>04</span><h3>GitHub</h3></div>
      <CopyChip command="npx markvis bake README.md" />
      <p>Writes a picture github.com can show. The block stays. <a class="home-quick-more" href="/integrate#bake">more →</a></p>
    </article>
  </div>
</section>

<section id="colors">
  <div class="home-section-head">
    <h2>Your colors</h2>
    <p>The chart reads the page. Set a few CSS variables and every chart follows your text color, your grid, your series hues; switch to dark and nothing redraws. <a href="/theming#your-colors">Theming</a></p>
  </div>
  <ColorsDemo />
</section>

<section id="types">
  <div class="home-section-head">
    <h2>Seventeen kinds of chart</h2>
    <p>bar, line, area, scatter, pie, hist, heatmap, funnel, waterfall, radar, gauge, sankey, treemap, dumbbell, bullet, boxplot, calendar. That is the set, and each one is a block you can copy.</p>
  </div>
  <TypeGrid />
</section>

<section id="cta" class="home-final">
  <div class="home-dots" aria-hidden="true"></div>
  <div class="home-final-inner">
    <img class="site-logo site-logo-light site-logo-lg" src="/logo.png" width="64" height="64" alt="" />
    <img class="site-logo site-logo-dark site-logo-lg" src="/logo-dark.png" width="64" height="64" alt="" />
    <h2>Write the numbers. Get the chart.</h2>
    <p class="home-final-actions">
      <a class="home-btn filled" href="/play">Play</a>
      <a class="home-btn outline" href="https://github.com/geekplux/markvis" target="_blank" rel="noreferrer"><span class="home-gh" aria-hidden="true"></span> GitHub <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
    </p>
  </div>
</section>

</div>
</main>

</div>
