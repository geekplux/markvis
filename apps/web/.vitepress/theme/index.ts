import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import Gallery from "../../components/Gallery.vue";
import PlayEmbed from "../../components/PlayEmbed.vue";
import SiteNav from "../../components/SiteNav.vue";
import "./site.css";
import "./gallery.css";
import "./home.css";
import "./family.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-top": () => h(SiteNav),
    });
  },
  enhanceApp({ app }) {
    app.component("Gallery", Gallery);
    app.component("PlayEmbed", PlayEmbed);
  },
} satisfies Theme;
