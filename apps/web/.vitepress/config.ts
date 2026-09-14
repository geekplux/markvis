import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../../..");

function docsSidebar() {
  return [
    { text: "Get started", link: "/get-started" },
    { text: "Integrate", link: "/integrate" },
    { text: "Spec", link: "/spec" },
    { text: "Themes", link: "/themes" },
    { text: "AI", link: "/ai" },
    { text: "Contributing themes", link: "/contributing-themes" },
  ];
}

const docsSidebarPaths = [
  "/docs",
  "/get-started",
  "/integrate",
  "/spec",
  "/themes",
  "/ai",
  "/contributing-themes",
];

const siteModeBoot = `(function(){try{var k='markvis-site-mode';var m=localStorage.getItem(k);if(m!=='light'&&m!=='dark'){m=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(m);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default defineConfig({
  title: "MarkVis",
  description: "Quantitative charts in Markdown — the fence is the data.",
  head: [
    ["script", {}, siteModeBoot],
    ["link", { rel: "icon", href: "/favicon.png", type: "image/png" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
    ["meta", { property: "og:title", content: "MarkVis" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Quantitative charts in Markdown — the fence is the data.",
      },
    ],
    [
      "meta",
      { property: "og:image", content: "https://markvis.js.org/og.png" },
    ],
    ["meta", { property: "og:url", content: "https://markvis.js.org/" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      { name: "twitter:image", content: "https://markvis.js.org/og.png" },
    ],
  ],
  vite: {
    resolve: {
      alias: {
        // Enhance-only: do not alias full @markvis/browser / render-svg (node:crypto).
        "@markvis/browser/enhance": resolve(repoRoot, "packages/browser/src/enhance.ts"),
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
    siteTitle: "MarkVis",
    nav: [
      { text: "Docs", link: "/get-started" },
      { text: "Examples", link: "/examples" },
      { text: "Playground", link: "/play" },
      { text: "AI", link: "/ai" },
      { text: "GitHub", link: "https://github.com/geekplux/markvis" },
    ],
    sidebar: Object.fromEntries(
      docsSidebarPaths.map((path) => [path, docsSidebar()]),
    ),
    footer: {
      message: "0.0.13 lives under legacy/",
      copyright: "MIT · github.com/geekplux/markvis",
    },
  },
});
