<script setup lang="ts">
import { computed, ref } from "vue";
import { render } from "@markvis/html";

/** One chart block drawn by render(): a figure, or the rows and one error line. */
const props = defineProps<{ block: string; editable?: boolean }>();
const text = ref(props.block);
const html = computed(() => render(text.value).html);
</script>

<template>
  <div class="chart-block" :class="{ 'chart-block-live': editable }">
    <textarea
      v-if="editable"
      v-model="text"
      class="chart-block-source"
      spellcheck="false"
      aria-label="Chart block; edit to redraw"
    />
    <div class="chart-block-figure" v-html="html" />
  </div>
</template>
