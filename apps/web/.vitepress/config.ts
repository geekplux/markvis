import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../../..");

function docsSidebar() {
  return [
    { text: "Spec", link: "/spec" },
    { text: "Integrate", link: "/integrate" },
    { text: "AI", link: "/ai" },
    { text: "Themes", link: "/themes" },
  ];
}

const siteModeBoot = `(function(){try{var k='markvis-site-mode';var m=localStorage.getItem(k);if(m!=='light'&&m!=='dark'){m=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(m);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default defineConfig({
  title: "markvis",
  description: "Quantitative charts in Markdown — the fence is the data.",
  head: [["script", {}, siteModeBoot]],
  vite: {
    resolve: {
      alias: {
        "@markvis/browser/enhance": resolve(repoRoot, "packages/browser/src/enhance.ts"),
        "@markvis/browser": resolve(repoRoot, "packages/browser/src/index.ts"),
        "@markvis/parser": resolve(repoRoot, "packages/parser/src/index.ts"),
        "@markvis/render-svg": resolve(
          repoRoot,
          "packages/render-svg/src/index.ts",
        ),
        "@markvis/ir": resolve(repoRoot, "packages/ir/src/index.ts"),
      },
    },
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
    sidebar: {
      "/spec": docsSidebar(),
      "/integrate": docsSidebar(),
      "/ai": docsSidebar(),
      "/themes": docsSidebar(),
    },
    footer: {
      message: "0.0.13 lives under legacy/",
      copyright: "MIT · github.com/geekplux/markvis",
    },
  },
});
