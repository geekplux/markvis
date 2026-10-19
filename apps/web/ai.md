---
title: Tell a model
pageClass: folio-docs
sidebar: true
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=/integrate#tell-a-model"
  - - link
    - rel: canonical
      href: "https://markvis.js.org/integrate"
---

# Tell a model

The model instruction is on Integrate now: [Tell a model](/integrate#tell-a-model).

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/ai" || path === "/ai.html") {
    window.location.replace("/integrate#tell-a-model");
  }
});
</script>
