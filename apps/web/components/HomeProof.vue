<script setup lang="ts">
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
  "81-sankey-airport-ground": urlFor("81-sankey-airport-ground"),
});
</script>

<template>
  <div class="home-grid home-proof-grid">
    <a
      v-for="view in views"
      :key="view.stem"
      class="home-proof-cell"
      :href="`/examples?id=${view.stem}`"
    >
      <figure>
        <img :src="view.src" :alt="view.title" width="720" height="480" />
        <figcaption>{{ view.title }}</figcaption>
      </figure>
    </a>
  </div>
</template>
