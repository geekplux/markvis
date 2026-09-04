import { defineConfig } from "vitepress";

export default defineConfig({
  title: "markvis",
  description: "Quantitative charts in Markdown — the fence is the data.",
  themeConfig: {
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
