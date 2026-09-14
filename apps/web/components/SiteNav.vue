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

const isDocs = computed(() => {
  const cls = pageClass.value;
  if (cls === "folio-docs") return true;
  const path = routeKey(
    String(page.value.relativePath ? "/" + page.value.relativePath.replace(/\.md$/, "") : ""),
  );
  return (
    path === "/docs" ||
    path === "/get-started" ||
    path === "/spec" ||
    path === "/integrate" ||
    path === "/ai" ||
    path === "/themes" ||
    path === "/contributing-themes"
  );
});

const docsLinks = [
  { href: "/get-started", text: "Get started" },
  { href: "/integrate", text: "Integrate" },
  { href: "/spec", text: "Spec" },
  { href: "/themes", text: "Themes" },
  { href: "/ai", text: "AI" },
  { href: "/contributing-themes", text: "Contributing themes" },
] as const;

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
      <div id="site-nav-links" class="home-nav-links">
        <a href="/get-started" @click="closeMenu">Docs</a>
        <a href="/examples" @click="closeMenu">Examples</a>
        <a href="/play" @click="closeMenu">Playground</a>
        <a href="/ai" @click="closeMenu">AI</a>
        <div v-if="isDocs" class="home-nav-docs">
          <p class="home-nav-docs-label">Docs</p>
          <a
            v-for="link in docsLinks"
            :key="link.href"
            :href="link.href"
            @click="closeMenu"
          >{{ link.text }}</a>
        </div>
      </div>
      <div class="home-nav-right">
        <button
          type="button"
          class="home-nav-menu"
          :aria-expanded="menuOpen"
          aria-controls="site-nav-links"
          @click="toggleMenu"
        >
          Menu
        </button>
        <a
          class="home-nav-github"
          href="https://github.com/geekplux/markvis"
          target="_blank"
          rel="noreferrer"
          aria-label="Star MarkVis on GitHub"
          @click="closeMenu"
        >
          <svg
            class="home-nav-github-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.68 7.68 0 0 1 8 4.07c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          Star
        </a>
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
