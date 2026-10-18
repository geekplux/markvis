<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import ChartBlock from "./ChartBlock.vue";
import { data as cards } from "../src/typeCards.data";

/**
 * One card per chart type, in SPEC order. A card draws its chart only when
 * it scrolls near the viewport, so the page does not hold every SVG at once.
 */
const drawn = reactive<Record<string, boolean>>({});
const grid = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  const root = grid.value;
  if (!root) return;
  if (typeof IntersectionObserver === "undefined") {
    for (const card of cards) drawn[card.type] = true;
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const type = (entry.target as HTMLElement).dataset.type;
        if (type) drawn[type] = true;
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "240px 0px" },
  );
  for (const el of root.querySelectorAll<HTMLElement>(".type-card[data-type]")) {
    observer.observe(el);
  }
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div ref="grid" class="type-grid">
    <article
      v-for="card in cards"
      :key="card.type"
      class="type-card"
      :data-type="card.type"
    >
      <div class="type-card-head">
        <h3 class="type-card-name"><a :href="`/types/${card.type}`">{{ card.type }}</a></h3>
        <a class="type-card-play" :href="card.play">Open in Play <span aria-hidden="true">↗</span></a>
      </div>
      <p class="type-card-use">{{ card.use }}</p>
      <div class="type-card-figure">
        <ChartBlock v-if="drawn[card.type]" :block="card.block" />
        <div v-else class="type-card-placeholder" aria-hidden="true" />
      </div>
      <details class="type-card-block">
        <summary>block ▾</summary>
        <pre><code>{{ card.block }}</code></pre>
      </details>
    </article>
  </div>
</template>
