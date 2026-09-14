---
title: Docs
pageClass: folio-docs
sidebar: true
---

# Docs

Same family as the rest of the site. Start here, then follow the side links.

- [Get started](/get-started) — play, bake, script, skill
- [Integrate](/integrate) — four paste blocks
- [Spec](/spec) — grammar, fields, types, errors
- [Themes](/themes) — theme vs palette, packs
- [AI](/ai) — fetch `/llms.txt`, emit only those fields
- [Contributing themes](/contributing-themes) — how to add a pack

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
