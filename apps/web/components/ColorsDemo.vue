<script setup lang="ts">
import { computed, ref } from "vue";
import { render } from "@markvis/html";
import { HERO_LINES } from "../src/hero";

/**
 * "Your colors": the same chart drawn on a light page and on a dark page.
 * The SVG is one string, rendered once; each page sets a few --markvis-*
 * variables and the chart follows them without drawing again.
 */
type Page = "light" | "dark";

const PAGES: Record<Page, { label: string; vars: [string, string][] }> = {
  light: {
    label: "Light page",
    vars: [
      ["--markvis-ink", "#0b1a4a"],
      ["--markvis-muted", "#5a6a8a"],
      ["--markvis-grid", "#0b1a4a"],
      ["--markvis-paper", "#ffffff"],
      ["--markvis-series-1", "#002fa7"],
      ["--markvis-series-2", "#0f766e"],
      ["--markvis-series-3", "#b45309"],
      ["--markvis-series-4", "#7c3aed"],
    ],
  },
  dark: {
    label: "Dark page",
    vars: [
      ["--markvis-ink", "#e8edf8"],
      ["--markvis-muted", "#9aa6c2"],
      ["--markvis-grid", "#e8edf8"],
      ["--markvis-paper", "#0b1020"],
      ["--markvis-series-1", "#7aa2ff"],
      ["--markvis-series-2", "#2dd4bf"],
      ["--markvis-series-3", "#fbbf24"],
      ["--markvis-series-4", "#c4b5fd"],
    ],
  },
};
const ORDER: Page[] = ["light", "dark"];

// The hero's block, grouped instead of stacked.
const block = HERO_LINES.filter((line) => !line.startsWith("layout:")).join("\n");
const result = render(block, { width: 640 });
const svg = result.ok ? result.svg : result.html;
// One string on the page twice (and the hero may draw it too): give each copy its own ids.
const ids = [...new Set(svg.match(/\bmv-[0-9a-f]+/g) ?? [])];
const svgFor = (page: Page) => ids.reduce((out, id) => out.split(id).join(`${id}-${page}`), svg);

const active = ref<Page>("light");
const css = computed(() => {
  const body = PAGES[active.value].vars.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `.page {\n${body}\n}`;
});
const style = (page: Page) => Object.fromEntries(PAGES[page].vars);
</script>

<template>
  <div class="colors-demo">
    <div class="colors-code">
      <div class="colors-toggle" role="group" aria-label="Page">
        <button
          v-for="page in ORDER"
          :key="page"
          type="button"
          class="colors-toggle-btn"
          :class="{ active: active === page }"
          :aria-pressed="active === page"
          @click="active = page"
        >
          {{ PAGES[page].label }}
        </button>
      </div>
      <pre class="colors-css"><code>{{ css }}</code></pre>
      <p class="colors-caption">Leave them unset and the chart uses its own defaults.</p>
    </div>
    <div class="colors-pages">
      <div
        v-for="page in ORDER"
        :key="page"
        class="colors-page"
        :class="[`colors-page-${page}`, { active: active === page }]"
        :style="style(page)"
        :aria-label="PAGES[page].label"
        role="group"
      >
        <span class="colors-page-label">{{ PAGES[page].label }}</span>
        <div class="colors-figure" v-html="svgFor(page)" />
      </div>
    </div>
  </div>
</template>
