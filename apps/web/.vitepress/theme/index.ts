import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Gallery from "../../components/Gallery.vue";
import "./gallery.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Gallery", Gallery);
  },
} satisfies Theme;
