<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { initSiteMode } from "../.vitepress/theme/siteMode";

const { frontmatter, page } = useData();

function routeKey(raw: string): string {
  const path = raw.split("?")[0].split("#")[0].replace(/\.html$/, "").replace(/\/$/, "");
  return path || "/";
}

const pageClass = computed(() => String(frontmatter.value.pageClass ?? ""));

const isHome = computed(() => pageClass.value === "folio-home-page");

const menuOpen = ref(false);

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value;
}

function closeMenu(): void {
  menuOpen.value = false;
}

const show = computed(() => {
  const cls = pageClass.value;
  if (
    cls === "folio-home-page" ||
    cls === "folio-examples" ||
    cls === "folio-play" ||
    cls === "folio-docs"
  ) {
    return true;
  }
  const path = routeKey(
    String(page.value.relativePath ? "/" + page.value.relativePath.replace(/\.md$/, "") : ""),
  );
  return (
    path === "/" ||
    path === "/examples" ||
    path === "/docs" ||
    path === "/get-started" ||
    path === "/spec" ||
    path === "/integrate" ||
    path === "/ai" ||
    path === "/themes" ||
    path === "/contributing-themes" ||
    path === "/play"
  );
});

onMounted(() => {
  initSiteMode();
});
</script>

<template>
  <header v-if="show" class="site-header">
    <a class="skip-link" :href="isHome ? '#features' : '#docs-content'">Skip to content</a>
    <nav
      class="home-nav family-nav site-rail rail-joints rail-joints-bottom"
      :class="{ 'is-open': menuOpen }"
      aria-label="Site"
    >
      <a class="home-wordmark" href="/" aria-label="MarkVis home" @click="closeMenu">
        <img class="site-logo site-logo-light" src="/logo.png" width="28" height="28" alt="" />
        <img class="site-logo site-logo-dark" src="/logo-dark.png" width="28" height="28" alt="" />
        <span>MarkVis</span>
      </a>
      <button
        type="button"
        class="home-nav-menu"
        :aria-expanded="menuOpen"
        aria-controls="site-nav-links"
        @click="toggleMenu"
      >
        Menu
      </button>
      <div id="site-nav-links" class="home-nav-links">
        <a href="/get-started" @click="closeMenu">Docs</a>
        <a href="/examples" @click="closeMenu">Examples</a>
        <a href="/play" @click="closeMenu">Playground</a>
        <a href="/ai" @click="closeMenu">AI</a>
      </div>
      <div class="home-nav-right">
        <button
          type="button"
          class="home-nav-mode"
          data-site-mode-toggle
          data-mode="dark"
          aria-label="Switch to light mode"
        >
          <svg
            class="home-nav-mode-icon home-nav-mode-sun"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              cx="9"
              cy="9"
              r="3.25"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            />
            <path
              d="M9 1.5v2.25M9 14.25V16.5M1.5 9h2.25M14.25 9H16.5M3.7 3.7l1.6 1.6M12.7 12.7l1.6 1.6M14.3 3.7l-1.6 1.6M5.3 12.7l-1.6 1.6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="square"
            />
          </svg>
        </button>
        <a class="home-nav-action" href="/play">Playground</a>
      </div>
    </nav>
  </header>
</template>
