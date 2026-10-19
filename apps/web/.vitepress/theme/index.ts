import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { defineAsyncComponent, h } from "vue";
import PlayEmbed from "../../components/PlayEmbed.vue";
import SiteNav from "../../components/SiteNav.vue";
import FamilyFoot from "../../components/FamilyFoot.vue";
import CopyChip from "../../components/CopyChip.vue";
import ThemeStrip from "../../components/ThemeStrip.vue";
import ChartBlock from "../../components/ChartBlock.vue";
import TypeGrid from "../../components/TypeGrid.vue";
import HeroStage from "../../components/HeroStage.vue";
import ColorsDemo from "../../components/ColorsDemo.vue";
import { initSiteMode } from "./siteMode";
import "./site-mode.css";
import "./site.css";
import "./gallery.css";
import "./home.css";
import "./family.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-top": () => h(SiteNav),
      "layout-bottom": () => h(FamilyFoot),
    });
  },
  enhanceApp({ app }) {
    // Lazy: Gallery carries every example SVG, so it stays out of the
    // theme chunk that every page preloads.
    app.component(
      "Gallery",
      defineAsyncComponent(() => import("../../components/Gallery.vue")),
    );
    app.component("PlayEmbed", PlayEmbed);
    app.component("CopyChip", CopyChip);
    app.component("ThemeStrip", ThemeStrip);
    app.component("ChartBlock", ChartBlock);
    app.component("HeroStage", HeroStage);
    app.component("ColorsDemo", ColorsDemo);
    app.component("TypeGrid", TypeGrid);
    if (typeof window !== "undefined") {
      initSiteMode();
    }
  },
} satisfies Theme;
