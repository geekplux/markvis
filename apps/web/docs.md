---
title: Docs
pageClass: folio-docs
sidebar: true
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=/get-started"
  - - link
    - rel: canonical
      href: "https://markvis.js.org/get-started"
---

# Docs

Same family as the rest of the site. Start here, then follow the side links.

- [Get started](/get-started) — play, bake, script, skill
- [Integrate](/integrate) — script tag, JavaScript, React, Markdown plugins, bake, and the model instruction
- [Theming](/theming) — theme vs palette, packs
- [Chart types](/types/) — one page per type
- [Spec](/spec) — grammar, fields, types, errors
- [Contributing](/contributing-themes) — how to add a theme pack

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/docs" || path === "/docs.html") {
    window.location.replace("/get-started");
  }
});
</script>
