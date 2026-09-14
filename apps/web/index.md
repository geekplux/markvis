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
  <p class="home-sub">Write a table in a Markdown code block. MarkVis draws the chart. Change a number — the picture changes. If the chart cannot draw, you still see the table.</p>
  <p class="home-cta">
    <a class="home-btn filled" href="#quickstart">Get started</a>
    <a class="home-btn outline" href="/get-started">Docs <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
    <a class="home-btn outline" href="/examples">Examples <span class="home-btn-arrow" aria-hidden="true">↗</span></a>
  </p>
  <div class="home-install">
    <CopyChip command="pnpm markvis bake README.md" />
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
      <h3>The table never disappears</h3>
      <p>If something is wrong, you still see the rows — never a blank hole.</p>
    </article>
    <article class="home-feature">
      <h3>Six kinds of chart</h3>
      <p>bar, line, area, scatter, pie, hist. That is the set.</p>
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
      <div class="home-quick-title"><span>01</span><h3>Try it</h3></div>
      <pre class="home-quick-code">Open /play. Paste a block. The chart appears.</pre>
      <p>Same text, same picture.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>02</span><h3>Save a picture</h3></div>
      <CopyChip command="pnpm markvis bake README.md" />
      <p>Keeps the Markdown; writes the picture after it so GitHub can show it.</p>
    </article>
    <article class="home-quick">
      <div class="home-quick-title"><span>03</span><h3>Ask an AI</h3></div>
      <pre class="home-quick-code">skills/markvis/SKILL.md</pre>
      <p>Point an agent at the Skill or /llms.txt. It writes the block, not a screenshot.</p>
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
