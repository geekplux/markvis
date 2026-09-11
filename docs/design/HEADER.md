# HEADER — site chrome lock

Left: wordmark. Center: DOCS · EXAMPLES · PLAY · AI.
Right cluster (`.home-nav-right`): site light/dark toggle · PLAYGROUND.
Desktop grid: `1fr auto 1fr` (wordmark | links | right). Mode is site mode, not chart theme.
Mode must not be its own mid-nav grid column between links and Playground.
Mobile ≤768: Menu for links; mode + Playground stay visible in the right cluster.
At 390px keep toggle + Playground in that cluster (or overflow menu) — never between text links.
Wrap mode + Playground in `.home-nav-right` in `SiteNav.vue` and home `index.md`; CSS flex row gap 8px justify-self end in `home.css` + `family.css`.
