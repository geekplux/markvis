Vue 3.5.44, checked with `npm install && npm run build`.

# Vue

`Chart.vue` takes the text inside a `chart`, `markvis`, or `vis` code block and puts `render(text).html` into `v-html`:

```vue
<script setup>
import { computed } from "vue";
import { render } from "markvis";
const props = defineProps({ source: { type: String, required: true } });
const html = computed(() => render(props.source).html);
</script>

<template><div class="markvis-host" v-html="html"></div></template>
```

`render()` never throws. A good block gives a figure with the SVG and its data table; a bad one gives the table and one error line, so the numbers stay. Every title, label, and cell is escaped, so the HTML is safe for `v-html`.

Use it where your Markdown renderer hands you a code block's language and text. If replies stream in, draw a block once its closing fence has arrived and show its text until then.

## Colors

The chart reads `--markvis-*` CSS variables, with fixed colors as fallbacks. Map your own:

```css
.markvis-host {
  --markvis-ink: var(--text);
  --markvis-muted: var(--text-muted);
  --markvis-grid: var(--text);
  --markvis-paper: var(--bg);
  --markvis-plate: var(--bg);
  --markvis-plot: var(--bg);
}
```

`--markvis-grid` takes the text color: grid lines are drawn faint, so a pale border color would vanish.

## Run it

The published package is `markvis@^2.2.0`. Until it is on npm, this recipe installs the tarball packed from this repository:

```bash
pnpm install && pnpm build && npm pack --ignore-scripts && mv markvis-*.tgz markvis.tgz   # from the repository root
cd examples/hosts/vue
npm install && npm run build
```

`build.mjs` compiles `Chart.vue` for the server, renders `examples/valid/01-bar-basic.md` and `examples/invalid/01-unknown-type.md` through it, and writes `dist/index.html`. It fails unless the valid page has `<svg` and `data-chart-type="bar"`, and the invalid page has `markvis-error` and `<table`.
