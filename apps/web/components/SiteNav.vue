<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { frontmatter, page } = useData();

function routeKey(raw: string): string {
  const path = raw.split("?")[0].split("#")[0].replace(/\.html$/, "").replace(/\/$/, "");
  return path || "/";
}

const show = computed(() => {
  const cls = String(frontmatter.value.pageClass ?? "");
  if (cls === "folio-examples" || cls === "folio-play" || cls === "folio-docs") {
    return true;
  }
  const path = routeKey(String(page.value.relativePath ? "/" + page.value.relativePath.replace(/\.md$/, "") : ""));
  return (
    path === "/examples" ||
    path === "/spec" ||
    path === "/integrate" ||
    path === "/ai" ||
    path === "/themes" ||
    path === "/play"
  );
});
</script>

<template>
  <nav v-if="show" class="home-nav family-nav" aria-label="Site">
    <a class="home-wordmark" href="/">markvis</a>
    <input type="checkbox" id="family-nav-toggle" class="home-nav-toggle" />
    <label class="home-nav-menu" for="family-nav-toggle">Menu</label>
    <div class="home-nav-links">
      <a href="/spec">Docs</a>
      <a href="/examples">Examples</a>
      <a href="/play">Play</a>
      <a href="/ai">AI</a>
    </div>
    <a class="home-nav-action" href="/play">Playground</a>
  </nav>
</template>
