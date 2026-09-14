<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

const show = computed(() => {
  const cls = String(frontmatter.value.pageClass ?? "");
  return cls === "folio-home-page" || cls === "folio-examples" || cls === "folio-docs";
});
</script>

<template>
  <footer v-if="show" class="family-foot">
    <div class="site-rail rail-joints rail-joints-top family-foot-inner">
      <p class="family-foot-copy">© 2026 GeekPlux · MIT · 0.0.13 under <code>legacy/</code></p>
      <nav aria-label="Footer">
        <a href="/get-started">Docs</a>
        <a href="/examples">Examples</a>
        <a href="/play">Playground</a>
        <a href="/ai">AI</a>
        <a href="https://github.com/geekplux/markvis">GitHub</a>
      </nav>
    </div>
  </footer>
</template>
