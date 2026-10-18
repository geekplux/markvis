<script setup lang="ts">
import { computed } from "vue";
import { render } from "@markvis/html";

/**
 * One chart block drawn by render(): a figure, or the rows and one error line.
 * The figure takes its colors from the site mode (see .chart-block-figure).
 */
const props = defineProps<{ block: string }>();
const html = computed(() => render(props.block).html);
</script>

<template>
  <div class="chart-block">
    <div class="chart-block-figure" v-html="html" />
  </div>
</template>
