import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import Gallery from "../../components/Gallery.vue";
import PlayEmbed from "../../components/PlayEmbed.vue";
import SiteNav from "../../components/SiteNav.vue";
import FamilyFoot from "../../components/FamilyFoot.vue";
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
    app.component("Gallery", Gallery);
    app.component("PlayEmbed", PlayEmbed);
    if (typeof window !== "undefined") {
      initSiteMode();
    }
  },
} satisfies Theme;
