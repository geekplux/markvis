<script setup>
import { computed } from "vue";
import { render } from "markvis";

/** The text inside a chart, markvis, or vis code block. */
const props = defineProps({ source: { type: String, required: true } });
const html = computed(() => render(props.source).html);
</script>

<template><div class="markvis-host" v-html="html"></div></template>
