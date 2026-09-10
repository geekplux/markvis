<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  CHART_TYPES,
  THEMES,
  fenceForTheme,
  playHref,
  type ChartTheme,
  type ChartType,
  type GalleryItem,
} from "../src/catalog";
import { GALLERY_ITEMS } from "../src/items";

const TYPES: Array<"all" | ChartType> = ["all", ...CHART_TYPES];
const THEME_CHIPS: ChartTheme[] = [...THEMES];

const typeFilter = ref<"all" | ChartType>("all");
const themeFilter = ref<ChartTheme>("folio");
const detailTheme = ref<ChartTheme>("folio");
const selectedId = ref<string | null>(null);
const copyNote = ref("");
const savedScrollY = ref(0);

const items = GALLERY_ITEMS;

const visible = computed(() => {
  if (typeFilter.value === "all") {
    return items;
  }
  return items.filter((item) => item.type === typeFilter.value);
});

const selected = computed<GalleryItem | null>(() => {
  if (!selectedId.value) {
    return null;
  }
  return items.find((item) => item.id === selectedId.value) ?? null;
});

const selectedSvg = computed(() => {
  if (!selected.value) {
    return "";
  }
  return selected.value.svgsByTheme[detailTheme.value];
});

const selectedFence = computed(() => {
  if (!selected.value) {
    return "";
  }
  return fenceForTheme(selected.value.fence, detailTheme.value);
});

const selectedPlayHref = computed(() => {
  if (!selected.value) {
    return "/play";
  }
  return playHref(selected.value.id, detailTheme.value);
});

const subline = computed(() => {
  const theme = themeFilter.value;
  if (typeFilter.value === "all") {
    return `${visible.value.length} figures · ${theme} · six types · from examples/valid`;
  }
  return `${visible.value.length} figures · ${typeFilter.value} · ${theme}`;
});

function svgFor(item: GalleryItem): string {
  return item.svgsByTheme[themeFilter.value];
}

function readUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  selectedId.value = id && items.some((item) => item.id === id) ? id : null;
  const theme = params.get("theme");
  if (theme && THEME_CHIPS.includes(theme as ChartTheme)) {
    themeFilter.value = theme as ChartTheme;
    if (selectedId.value) {
      detailTheme.value = theme as ChartTheme;
    }
  }
}

function writeUrl(id: string | null): void {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set("id", id);
  } else {
    url.searchParams.delete("id");
  }
  const themeForUrl = id ? detailTheme.value : themeFilter.value;
  if (themeForUrl !== "folio") {
    url.searchParams.set("theme", themeForUrl);
  } else {
    url.searchParams.delete("theme");
  }
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function lockScroll(): void {
  savedScrollY.value = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY.value}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockScroll(): void {
  const y = savedScrollY.value;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, y);
}

function openItem(id: string): void {
  detailTheme.value = themeFilter.value;
  selectedId.value = id;
  writeUrl(id);
  lockScroll();
}

function closeDetail(): void {
  selectedId.value = null;
  writeUrl(null);
  unlockScroll();
}

function setTheme(theme: ChartTheme): void {
  themeFilter.value = theme;
  writeUrl(selectedId.value);
}

function setDetailTheme(theme: ChartTheme): void {
  detailTheme.value = theme;
  writeUrl(selectedId.value);
}

function onKey(event: KeyboardEvent): void {
  if (event.key === "Escape" && selectedId.value) {
    closeDetail();
  }
}

async function copyText(text: string, label: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    copyNote.value = label;
    window.setTimeout(() => {
      if (copyNote.value === label) {
        copyNote.value = "";
      }
    }, 1500);
  } catch {
    copyNote.value = "copy failed";
  }
}

watch(selectedId, (id, prev) => {
  if (id && !prev) {
    /* opened via URL */
    if (document.body.style.position !== "fixed") {
      lockScroll();
    }
  }
});

onMounted(() => {
  readUrl();
  if (selectedId.value) {
    detailTheme.value = themeFilter.value;
    lockScroll();
  }
  window.addEventListener("keydown", onKey);
  window.addEventListener("popstate", readUrl);
});

onUnmounted(() => {
  if (document.body.style.position === "fixed") {
    unlockScroll();
  }
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("popstate", readUrl);
});
</script>

<template>
  <div class="gallery-page">
    <h1 class="gallery-title">Examples</h1>
    <p class="gallery-sub">{{ subline }}</p>

    <div class="gallery-filters" role="tablist" aria-label="Chart type">
      <button
        v-for="chip in TYPES"
        :key="chip"
        type="button"
        class="gallery-chip"
        :class="{ active: typeFilter === chip }"
        :aria-pressed="typeFilter === chip"
        @click="typeFilter = chip"
      >
        {{ chip === "all" ? "All" : chip }}
      </button>
    </div>

    <div class="gallery-filters" role="tablist" aria-label="Chart theme">
      <button
        v-for="chip in THEME_CHIPS"
        :key="chip"
        type="button"
        class="gallery-chip"
        :class="{ active: themeFilter === chip }"
        :aria-pressed="themeFilter === chip"
        :data-theme="chip"
        @click="setTheme(chip)"
      >
        {{ chip }}
      </button>
    </div>

    <div class="gallery-layout">
      <div class="gallery-grid">
        <button
          v-for="item in visible"
          :key="item.id"
          type="button"
          class="gallery-card"
          :data-type="item.type"
          :data-id="item.id"
          :data-theme="themeFilter"
          :aria-label="item.title"
          @click="openItem(item.id)"
        >
          <div class="gallery-thumb" v-html="svgFor(item)" />
          <p class="gallery-card-caption">{{ item.title }}</p>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selected" class="gallery-overlay" role="dialog" aria-modal="true">
        <button
          type="button"
          class="gallery-backdrop"
          aria-label="Close detail"
          @click="closeDetail"
        />
        <aside class="gallery-drawer" aria-live="polite">
          <button type="button" class="gallery-close" @click="closeDetail">
            Close
          </button>
          <h2 class="gallery-detail-title">{{ selected.title }}</h2>
          <div class="gallery-full" v-html="selectedSvg" />
          <div class="gallery-filters gallery-detail-themes" role="tablist" aria-label="Detail theme">
            <button
              v-for="chip in THEME_CHIPS"
              :key="`detail-${chip}`"
              type="button"
              class="gallery-chip"
              :class="{ active: detailTheme === chip }"
              :aria-pressed="detailTheme === chip"
              :data-theme="chip"
              @click="setDetailTheme(chip)"
            >
              {{ chip }}
            </button>
          </div>
          <div class="gallery-actions">
            <button type="button" @click="copyText(selectedFence, 'Copied fence')">
              Copy fence
            </button>
            <button type="button" @click="copyText(selectedSvg, 'Copied SVG')">
              Copy SVG
            </button>
            <a class="gallery-play" :href="selectedPlayHref">Open in Play</a>
            <span v-if="copyNote" class="gallery-copied">{{ copyNote }}</span>
          </div>
          <pre class="gallery-fence">{{ selectedFence }}</pre>
        </aside>
      </div>
    </Teleport>
  </div>
</template>
