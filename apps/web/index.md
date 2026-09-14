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
    <span>The fence is the data.</span>
  </h1>
  <p class="home-sub">A Markdown fence — CSV or a GFM table — parses to IR and a deterministic SVG. Types: bar, line, area, scatter, pie, hist. Same text, same figure. No plugin, the table stays.</p>
  <p class="home-cta">
    <a class="home-btn filled" href="#quickstart">Get started</a>
    <a class="home-btn outline" href="/get-started">Docs <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
    <a class="home-btn outline" href="/examples">Examples <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
  </p>
  <div class="home-install">
    <CopyChip command="npx markvis bake README.md" />
  </div>
</section>

<section id="proof">
  <div class="home-section-head">
    <h2>Figures</h2>
    <p>Same text, same figure. Folio marks from examples/out — uncropped.</p>
  </div>
  <HomeProof />
</section>

<section id="features">
  <div class="home-section-head">
    <h2>Features</h2>
  </div>
  <div class="home-grid home-features-grid">
    <article class="home-feature">
      <h3>Library you can drop in</h3>
      <p>Play, bake, a plugin, or a Skill. One name: markvis.</p>
    </article>
    <article class="home-feature">
      <h3>Any Markdown view</h3>
      <p>Works in any Markdown preview or rendered page. The fence is the figure.</p>
    </article>
    <article class="home-feature">
      <h3>Same fence, same SVG</h3>
      <p>Same fence text always yields the same SVG. Deterministic. No plugin, the table stays.</p>
    </article>
    <article class="home-feature">
      <h3>Table fallback</h3>
      <p>Illegal input keeps a table plus one error line. Never drop the data.</p>
    </article>
    <article class="home-feature">
      <h3>Six types</h3>
      <p>bar, line, area, scatter, pie, hist. Frozen.</p>
    </article>
    <article class="home-feature">
      <h3>CSV or GFM table</h3>
      <p>The data is the source. Not JSON as the default. No JavaScript in a fence.</p>
    </article>
    <article class="home-feature">
      <h3>Parser to IR to SVG</h3>
      <p>Fence, GFM table, or HTML comment to Chart IR to handwritten SVG.</p>
    </article>
    <article class="home-feature">
      <h3>AI replies</h3>
      <p>Agents emit the fence. A figure, not a paragraph of numbers.</p>
    </article>
    <article class="home-feature">
      <h3>Themes</h3>
      <p>One fence fits the host. folio is the default. Site light/dark is chrome only — not theme.</p>
    </article>
  </div>
</section>

<section id="code">
  <div class="home-section-head">
    <h2>Fences</h2>
    <p>One language, three figures. Copy a fence and paste it in Play.</p>
  </div>
  <FenceTabs />
</section>

<section id="quickstart">
  <div class="home-section-head">
    <h2>Quickstart</h2>
  </div>
  <div class="home-grid home-quick-grid">
    <article class="home-quick">
      <div class="home-quick-title"><span>01</span><h3>Play</h3></div>
      <pre class="home-quick-code">Open /play. Paste a fence. The SVG updates.</pre>
      <p>Same text, same figure.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>02</span><h3>Bake</h3></div>
      <CopyChip command="npx markvis bake README.md" />
      <p>Keeps the fence; writes the figure after it.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>03</span><h3>Skill</h3></div>
      <pre class="home-quick-code">skills/markvis/SKILL.md</pre>
      <p>Point an agent at the Skill or /llms.txt.</p>
    </article>
  </div>
</section>

<section id="hosts">
  <div class="home-grid home-hosts">
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">npm</span>
      <span class="home-host-status">clone + build</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">script</span>
      <span class="home-host-status">clone + build</span>
    </div>
    <div class="home-host">
      <span class="home-host-dot" aria-hidden="true"></span>
      <span class="home-host-name">skill</span>
      <span class="home-host-status">available now</span>
    </div>
  </div>
</section>

<section id="cta" class="home-final">
  <div class="home-dots" aria-hidden="true"></div>
  <div class="home-final-inner">
    <img class="site-logo site-logo-light site-logo-lg" src="/logo.png" width="44" height="44" alt="" />
    <img class="site-logo site-logo-dark site-logo-lg" src="/logo-dark.png" width="44" height="44" alt="" />
    <h2>Get started with MarkVis</h2>
    <p class="home-final-lead">Write a fence. Get a figure. Parser to IR to a deterministic SVG.</p>
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
