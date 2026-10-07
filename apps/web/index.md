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
    <span class="home-badge-left">OPEN SOURCE</span>
    <span class="home-badge-right">v2 · MIT</span>
  </p>
  <h1 class="home-headline">
    <span>Charts in Markdown.</span>
    <span>The numbers are the picture.</span>
  </h1>
  <p class="home-sub">Write a short chart block in Markdown; markvis draws it as SVG — from a script tag, JavaScript, React, or any Markdown renderer. Where it cannot draw, the numbers stay as a table.</p>
  <p class="home-cta">
    <a class="home-btn filled" href="#quickstart">Get started</a>
    <a class="home-btn outline" href="/get-started">Docs <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
    <a class="home-btn outline" href="/examples">Examples <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
    <a class="home-btn outline" href="/play">Play <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
  </p>
  <div class="home-live">
    <ChartBlock editable :block='"type: bar\ntitle: Visits by day\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5\nWed,4\nThu,6\nFri,8\n"' />
    <p class="home-live-note">Edit a number in the block; the chart redraws. That text is the whole chart.</p>
  </div>
  <div class="home-install">
    <CopyChip command="npx markvis bake README.md" />
  </div>
</section>

<section id="proof">
  <div class="home-section-head">
    <h2>Figures</h2>
    <p>The pictures below come from the same Markdown as the numbers. Nothing is hand-traced.</p>
  </div>
  <HomeProof />
</section>

<section id="features">
  <div class="home-section-head">
    <h2>Features</h2>
  </div>
  <div class="home-grid home-features-grid">
    <article class="home-feature">
      <h3>The data never disappears</h3>
      <p>Without markvis the block is readable text, and the comment form is a plain table. A block that cannot draw keeps its rows and shows one error line.</p>
    </article>
    <article class="home-feature">
      <h3>Try it in the browser</h3>
      <p>Open Play. Paste a block. No account, no install.</p>
    </article>
    <article class="home-feature">
      <h3>Lives in your Markdown</h3>
      <p>Notes, READMEs, docs sites. The numbers stay in the file.</p>
    </article>
    <article class="home-feature">
      <h3>Same text, same picture</h3>
      <p>The same block always draws the same chart. Not a one-off screenshot.</p>
    </article>
    <article class="home-feature">
      <h3>Safe by design</h3>
      <p>A block holds data only: no HTML, no scripts. Every title, label, and cell is escaped.</p>
    </article>
    <article class="home-feature">
      <h3>Seventeen kinds of chart</h3>
      <p>bar, line, area, scatter, pie, hist, heatmap, funnel, waterfall, radar, gauge, sankey, treemap, dumbbell, bullet, boxplot, calendar. That is the set.</p>
    </article>
    <article class="home-feature">
      <h3>Write a table of numbers</h3>
      <p>Comma-separated rows or a Markdown table. Not a blob of JSON.</p>
    </article>
    <article class="home-feature">
      <h3>Built for people and AI</h3>
      <p>A person or a model writes the same block. Not a screenshot.</p>
    </article>
    <article class="home-feature">
      <h3>Looks you can pick</h3>
      <p>folio is the default. Light and dark on this site are the page, not the chart.</p>
    </article>
    <article class="home-feature">
      <h3>Show it on GitHub too</h3>
      <p>Save a picture next to the text so any viewer can see the chart.</p>
    </article>
  </div>
</section>

<section id="code">
  <div class="home-section-head">
    <h2>Examples</h2>
    <p>Copy a block. Paste it in Play. That Markdown code block is the chart.</p>
  </div>
  <FenceTabs />
</section>

<section id="quickstart">
  <div class="home-section-head">
    <h2>Quickstart</h2>
  </div>
  <div class="home-grid home-quick-grid">
    <article class="home-quick">
      <div class="home-quick-title"><span>01</span><h3>One script tag</h3></div>
      <pre class="home-quick-code">&lt;script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"&gt;&lt;/script&gt;</pre>
      <p>In a page or a Markdown file. Every chart block on it draws.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>02</span><h3>JavaScript</h3></div>
      <pre class="home-quick-code">import { render } from "markvis";
el.innerHTML = render(block).html;</pre>
      <p>One call; it never throws.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>03</span><h3>React</h3></div>
      <pre class="home-quick-code">import { Markvis } from "markvis/react";
&lt;Markvis source={block} /&gt;</pre>
      <p>Follows its container; streams in react-markdown.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>04</span><h3>GitHub</h3></div>
      <pre class="home-quick-code">- uses: geekplux/markvis@master
  with: { paths: README.md }</pre>
      <p>Bakes pictures so github.com shows the charts. <a href="/integrations">All integrations</a></p>
    </article>
  </div>
</section>

<section id="hosts">
  <div class="home-grid home-hosts">
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">npm</span>
      <span class="home-host-status">available now</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">script</span>
      <span class="home-host-status">available now</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">skill</span>
      <span class="home-host-status">available now</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">action</span>
      <span class="home-host-status">available now</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">react</span>
      <span class="home-host-status">in 2.2</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">rehype</span>
      <span class="home-host-status">in 2.2</span>
    </div>
  </div>
</section>

<section id="cta" class="home-final">
  <div class="home-dots" aria-hidden="true"></div>
  <div class="home-final-inner">
    <img class="site-logo site-logo-light site-logo-lg" src="/logo.png" width="64" height="64" alt="" />
    <img class="site-logo site-logo-dark site-logo-lg" src="/logo-dark.png" width="64" height="64" alt="" />
    <h2>Get started with MarkVis</h2>
    <p class="home-final-lead">Write the numbers. Get the chart. The table stays in the file.</p>
    <p class="home-final-actions">
      <a class="home-btn filled" href="/play">Playground</a>
      <a class="home-btn outline" href="/get-started">Docs <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
      <a class="home-btn outline" href="/examples">Examples <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
      <a class="home-btn outline" href="https://github.com/geekplux/markvis" target="_blank" rel="noreferrer"><span class="home-gh" aria-hidden="true"></span> Star on GitHub</a>
    </p>
  </div>
</section>

</div>
</main>

</div>
