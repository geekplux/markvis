<script setup lang="ts">
import { onMounted, ref } from "vue";
import { playAppIframeSrc } from "../src/play";

const src = ref("/play-app/index.html");

onMounted(() => {
  src.value = playAppIframeSrc(window.location.search);
});
</script>

<template>
  <div class="play-embed">
    <iframe
      :src="src"
      title="Playground"
      class="play-embed-frame"
    />
  </div>
</template>

<style scoped>
.play-embed {
  position: fixed;
  top: var(--vp-nav-height, 52px);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  background: #ffffff;
}

.play-embed-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
