<script setup lang="ts">
import { THEMES } from "../src/catalog";

/** One fixture drawn in every theme, from the committed per-theme goldens. */
const props = withDefaults(defineProps<{ stem?: string }>(), {
  stem: "02-line-multi",
});

const svgModules = import.meta.glob("../../../examples/out/themes/*/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

const cells = THEMES.map((theme) => {
  const hit = Object.entries(svgModules).find(([path]) =>
    path.endsWith(`/themes/${theme}/${props.stem}.svg`),
  );
  if (!hit) {
    throw new Error(`missing examples/out/themes/${theme}/${props.stem}.svg`);
  }
  return { theme, src: hit[1], href: `/examples?id=${props.stem}&theme=${theme}` };
});
</script>

<template>
  <div class="theme-strip">
    <a v-for="cell in cells" :key="cell.theme" class="theme-strip-cell" :href="cell.href">
      <figure>
        <img :src="cell.src" :alt="`${stem} in the ${cell.theme} theme`" width="720" height="480" />
        <figcaption><code>{{ cell.theme }}</code></figcaption>
      </figure>
    </a>
  </div>
</template>

<style scoped>
.theme-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin: 16px 0;
}
.theme-strip-cell {
  display: block;
  text-decoration: none;
}
.theme-strip-cell figure {
  margin: 0;
}
/* Light-surface figures assume a light page; give them one in either site mode. */
.theme-strip-cell img {
  display: block;
  width: 100%;
  height: auto;
  background: #ffffff;
  border: 1px solid var(--vp-c-divider);
}
.theme-strip-cell figcaption {
  margin-top: 6px;
  font-size: 12px;
}
</style>
