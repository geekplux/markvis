<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { render } from "@markvis/html";
import {
  HERO_LINES,
  POSTER_CAPTION,
  SCENE_NAMES,
  SWATCHES,
  createHero,
  type HeroController,
} from "../src/hero";

/**
 * The home hero: the chart block types itself and the chart redraws with
 * every change. The server renders the poster (the finished chart), so the
 * first paint, crawlers, and reduced motion all get the whole picture.
 * The default slot sits between the stage and the data credit.
 */
const props = withDefaults(
  defineProps<{
    lines?: string[];
    autoplay?: boolean;
    charMs?: number;
    lineMs?: number;
    playHref?: string;
  }>(),
  {
    lines: () => [...HERO_LINES],
    autoplay: true,
    playHref: "/play",
  },
);

const text = props.lines.join("\n");
const poster = render(text, { width: 640 });
const posterHtml = poster.ok ? poster.svg : poster.html;

const root = ref<HTMLElement | null>(null);
let hero: HeroController | undefined;

onMounted(() => {
  if (!root.value) return;
  hero = createHero(root.value, {
    lines: props.lines,
    autoplay: props.autoplay,
    charMs: props.charMs,
    lineMs: props.lineMs,
  });
});

onBeforeUnmount(() => {
  hero?.destroy();
  hero = undefined;
});

defineExpose({
  goto: (n: number) => hero?.goto(n),
  play: (from?: number) => hero?.play(from),
  poster: () => hero?.poster(),
  edit: () => hero?.edit(),
  stop: () => hero?.stop(),
});
</script>

<template>
  <div class="hero-stage-wrap">
    <div ref="root" class="hero-stage">
      <div class="hero-stage-top">
        <span class="hero-tab">README.md</span>
        <span class="hero-swatches" hidden>
          <button
            v-for="s in SWATCHES"
            :key="s.hex"
            class="hero-sw"
            type="button"
            :style="{ '--c': s.hex }"
            :data-c="s.hex"
            :aria-label="`Series color ${s.name}`"
            aria-pressed="false"
          />
          <code class="hero-sw-read" aria-hidden="true" />
        </span>
        <span class="hero-cap" aria-live="polite">{{ POSTER_CAPTION }}</span>
      </div>
      <div class="hero-stage-body">
        <div class="hero-src">
          <div class="hero-fence" aria-hidden="true">```chart</div>
          <pre class="hero-pre" tabindex="0" title="Click to edit" aria-label="Chart block source. Press any key to edit it."><code><span class="hero-b">{{ text }}</span><mark class="hero-sel"></mark><span class="hero-caret" aria-hidden="true"></span><span class="hero-a"></span></code></pre>
          <textarea class="hero-ta" hidden spellcheck="false" aria-label="Chart block source" />
          <div class="hero-fence" aria-hidden="true">```</div>
        </div>
        <div class="hero-fig" data-state="chart">
          <div class="hero-layer" v-html="posterHtml" />
        </div>
      </div>
      <div class="hero-stage-foot">
        <div class="hero-track-wrap">
          <ol class="hero-track" aria-label="Scenes">
            <li v-for="(name, i) in SCENE_NAMES" :key="name">
              <button
                class="hero-tick done"
                type="button"
                :data-scene="i + 1"
                :aria-label="`Scene ${i + 1} of ${SCENE_NAMES.length}: ${name}`"
              />
            </li>
          </ol>
          <span class="hero-track-label" aria-hidden="true" hidden><b></b> <span></span></span>
        </div>
        <button class="hero-replay" type="button" hidden>Play</button>
        <span class="hero-bar" aria-hidden="true" />
      </div>
    </div>
    <slot />
    <p class="hero-note">
      <span>Data: US EIA, Monthly Energy Review 2023</span>
      <span aria-hidden="true"> · </span>
      <span>Click the text to edit it</span>
      <span aria-hidden="true"> · </span>
      <a :href="playHref">Open in Play <span aria-hidden="true">↗</span></a>
    </p>
  </div>
</template>
