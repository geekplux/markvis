---
title: Theming
pageClass: folio-docs
sidebar: true
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=/theming"
  - - link
    - rel: canonical
      href: "https://markvis.js.org/theming"
---

# Theming

Themes and palettes are on [Theming](/theming) now.

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/themes" || path === "/themes.html") {
    window.location.replace("/theming");
  }
});
</script>
