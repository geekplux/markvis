import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../../..");

export default defineConfig({
  title: "markvis",
  description: "Quantitative charts in Markdown — the fence is the data.",
  vite: {
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
  appearance: false,
  themeConfig: {
    siteTitle: "markvis",
    nav: [
      { text: "Play", link: "/play" },
      { text: "Examples", link: "/examples" },
      { text: "Spec", link: "/spec" },
      { text: "Integrate", link: "/integrate" },
      { text: "AI", link: "/ai" },
      { text: "GitHub", link: "https://github.com/geekplux/markvis" },
    ],
    sidebar: false,
    footer: {
      message: "0.0.13 lives under legacy/",
      copyright: "MIT · github.com/geekplux/markvis",
    },
  },
});
