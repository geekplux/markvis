<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { GALLERY_ITEMS } from "../src/items";
import { PROOF_STEMS, proofViews, type ProofStem } from "../src/homeProof";

const svgModules = import.meta.glob("../../../examples/out/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

function urlFor(stem: ProofStem): string {
  const hit = Object.entries(svgModules).find(([path]) =>
    path.endsWith(`/${stem}.svg`),
  );
  if (!hit) {
    throw new Error(`missing examples/out/${stem}.svg`);
  }
  return hit[1];
}

const views = proofViews(GALLERY_ITEMS, {
  "01-bar-basic": urlFor("01-bar-basic"),
  "02-line-multi": urlFor("02-line-multi"),
  "05-pie-raw": urlFor("05-pie-raw"),
});

const active = ref<ProofStem>("01-bar-basic");
const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

function fenceBlock(source: string): string {
  const match = source.match(/```(?:chart|markvis|vis)[\s\S]*?```/);
  return match ? match[0] : source;
}

const current = computed(() => {
  const view = views.find((entry) => entry.stem === active.value) ?? views[0];
  return { ...view, fence: fenceBlock(view.fence) };
});

const footer: Record<ProofStem, string> = {
  "01-bar-basic": "CSV body. Title is a conclusion.",
  "02-line-multi": "series column. Input row order is kept.",
  "05-pie-raw": "Raw values. Pie does not auto-normalize to 100.",
};

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(current.value.fence);
    copied.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    /* clipboard denied */
  }
}
</script>

<template>
  <div class="fence-tabs">
    <div class="fence-tabs-panel">
      <div class="fence-tabs-list" role="tablist" aria-label="Fence type">
        <button
          v-for="view in views"
          :key="view.stem"
          type="button"
          role="tab"
          class="fence-tabs-tab"
          :aria-selected="active === view.stem"
          :class="{ active: active === view.stem }"
          @click="active = view.stem"
        >
          {{ view.type }}
        </button>
      </div>
      <div class="fence-tabs-file">
        <span class="fence-tabs-filename"><span class="fence-file-icon" aria-hidden="true"></span>{{ current.stem }}.md</span>
        <button
          type="button"
          class="copy-chip-btn"
          :aria-label="copied ? 'Copied' : `Copy ${current.stem}.md`"
          @click="copy"
        >
          <svg
            v-if="!copied"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="5.5" y="5.5" width="8" height="8" />
            <path d="M10.5 5.5V3.5H2.5V11.5H5.5" />
          </svg>
          <svg
            v-else
            class="copy-chip-check"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
          >
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        </button>
      </div>
      <pre class="fence-tabs-code"><code>{{ current.fence }}</code></pre>
      <div class="fence-tabs-foot">
        <p>{{ footer[current.stem] }}</p>
        <a :href="`/play?example=${current.stem}`">Open in Playground <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </div>
</template>
