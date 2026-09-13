<script setup lang="ts">
import { onMounted, ref } from "vue";
import { playAppIframeSrc } from "../src/play";

const src = ref("/play-app/index.html");

onMounted(() => {
  src.value = playAppIframeSrc(window.location.search);
});
</script>

<template>
  <div class="play-shell site-rail">
    <div class="play-embed">
      <iframe
        :src="src"
        title="Playground"
        class="play-embed-frame"
      />
    </div>
  </div>
</template>
