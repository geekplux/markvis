---
title: Theming
pageClass: folio-docs
sidebar: true
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
