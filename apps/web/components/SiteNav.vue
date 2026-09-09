<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();

const show = computed(() => {
  const path = route.path.replace(/\/$/, "") || "/";
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
