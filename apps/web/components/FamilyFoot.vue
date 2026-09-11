<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

const show = computed(() => {
  const cls = String(frontmatter.value.pageClass ?? "");
  return cls === "folio-examples" || cls === "folio-docs";
});
</script>

<template>
  <footer v-if="show" class="family-foot">
    <nav aria-label="Footer">
      <a href="/get-started">Docs</a>
      <a href="/examples">Examples</a>
      <a href="/play">Play</a>
      <a href="https://github.com/geekplux/markvis">GitHub</a>
    </nav>
    <p>MIT · 0.0.13 under <code>legacy/</code></p>
  </footer>
</template>
