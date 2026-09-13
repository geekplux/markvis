<script setup lang="ts">
import { onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{ command: string; prefix?: string }>(),
  { prefix: "$" },
);

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.command);
    copied.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    /* clipboard denied */
  }
}
</script>

<template>
  <div class="copy-chip">
    <span v-if="prefix" class="copy-chip-prefix" aria-hidden="true">{{ prefix }}</span>
    <span class="copy-chip-cmd">{{ command }}</span>
    <button
      type="button"
      class="copy-chip-btn"
      :aria-label="copied ? 'Copied' : `Copy ${command}`"
      @click="copy"
    >
      <svg
        v-if="!copied"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="5.5" y="5.5" width="8" height="8" />
        <path d="M10.5 5.5V3.5H2.5V11.5H5.5" />
      </svg>
      <svg
        v-else
        class="copy-chip-check"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    </button>
    <span class="visually-hidden" aria-live="polite">{{ copied ? "Copied" : "" }}</span>
  </div>
</template>
