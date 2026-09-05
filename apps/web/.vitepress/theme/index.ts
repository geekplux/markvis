import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Gallery from "../../components/Gallery.vue";
import PlayEmbed from "../../components/PlayEmbed.vue";
import "./site.css";
import "./gallery.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Gallery", Gallery);
    app.component("PlayEmbed", PlayEmbed);
  },
} satisfies Theme;
