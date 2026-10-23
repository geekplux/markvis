import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type HeadConfig } from "vitepress";
import { TYPE_IDS } from "../src/type-pages";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../../..");

function docsSidebar() {
  return [
    { text: "Get started", link: "/get-started" },
    { text: "Integrate", link: "/integrate" },
    { text: "Theming", link: "/theming" },
    {
      text: "Chart types",
      link: "/types/",
      collapsed: true,
      items: TYPE_IDS.map((type) => ({ text: type, link: `/types/${type}` })),
    },
    { text: "Spec", link: "/spec" },
    { text: "Contributing", link: "/contributing-themes" },
  ];
}

// /themes and /ai stay as redirects (to /theming and to Integrate's
// "Tell a model"), so old links still land on the content.
const docsSidebarPaths = [
  "/docs",
  "/get-started",
  "/integrate",
  "/theming",
  "/types/",
  "/spec",
  "/contributing-themes",
  "/themes",
  "/ai",
];

const siteUrl = "https://markvis.js.org";
const siteTitle = "MarkVis";

// "index.md" -> "/", "get-started.md" -> "/get-started",
// "types/index.md" -> "/types/", "types/bar.md" -> "/types/bar".
function cleanPath(relativePath: string): string {
  const path = relativePath.replace(/\.md$/, "");
  if (path === "index") return "/";
  if (path.endsWith("/index")) return `/${path.slice(0, -"index".length)}`;
  return `/${path}`;
}

// A page that sets its own canonical in frontmatter (a redirect stub) keeps it.
function frontmatterCanonical(head: unknown): string | undefined {
  if (!Array.isArray(head)) return undefined;
  for (const entry of head) {
    if (!Array.isArray(entry) || entry[0] !== "link") continue;
    const attrs = entry[1] as Record<string, unknown> | undefined;
    if (attrs?.rel === "canonical" && typeof attrs.href === "string") return attrs.href;
  }
  return undefined;
}

// Google Analytics 4. Client-side route changes are counted by the property's
// enhanced measurement (browser history events), so one config call is enough.
const gaId = "G-TD85LK5TX0";
const gaBoot = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;

const siteModeBoot = `(function(){try{var k='markvis-site-mode';var m=localStorage.getItem(k);if(m!=='light'&&m!=='dark'){m=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(m);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default defineConfig({
  title: "MarkVis",
  // Same clean URLs as the canonical links; the redirect stubs stay out.
  sitemap: {
    hostname: siteUrl,
    transformItems: (items) =>
      items
        .map((item) => ({ ...item, url: item.url.replace(/\.html$/, "") }))
        .filter((item) => !["ai", "themes", "docs"].includes(item.url)),
  },
  // Per page: canonical, og:url, and og:title.
  transformHead({ pageData }) {
    if (pageData.isNotFound) return [];
    const own = frontmatterCanonical(pageData.frontmatter.head);
    const url = own ?? `${siteUrl}${cleanPath(pageData.relativePath)}`;
    const title = pageData.title?.trim() || siteTitle;
    const head: HeadConfig[] = [];
    if (!own) head.push(["link", { rel: "canonical", href: url }]);
    head.push(["meta", { property: "og:url", content: url }]);
    head.push(["meta", { property: "og:title", content: title }]);
    return head;
  },
  description: "Charts as text in Markdown. Where they cannot draw, the numbers stay as a table.",
  head: [
    ["script", {}, siteModeBoot],
    [
      "script",
      { async: "", src: `https://www.googletagmanager.com/gtag/js?id=${gaId}` },
    ],
    ["script", {}, gaBoot],
    ["link", { rel: "icon", href: "/favicon.png", type: "image/png" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Charts as text in Markdown. Where they cannot draw, the numbers stay as a table.",
      },
    ],
    [
      "meta",
      { property: "og:image", content: "https://markvis.js.org/og.png" },
    ],
    // The hero poster, captured from the built home page at 1200 x 630.
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
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
        "@markvis/browser/enhance": resolve(
          repoRoot,
          "packages/browser/src/enhance.ts",
        ),
        "@markvis/browser/preview": resolve(
          repoRoot,
          "packages/browser/src/preview.ts",
        ),
        "@markvis/ir": resolve(repoRoot, "packages/ir/src/index.ts"),
        "@markvis/types": resolve(repoRoot, "packages/types/registry.ts"),
        "@markvis/types/fence-keys": resolve(
          repoRoot,
          "packages/types/fence-keys.ts",
        ),
        "@markvis/themes": resolve(repoRoot, "packages/themes/registry.ts"),
        "@markvis/parser": resolve(repoRoot, "packages/parser/src/index.ts"),
        "@markvis/render-svg": resolve(
          repoRoot,
          "packages/render-svg/src/index.ts",
        ),
        "@markvis/html": resolve(repoRoot, "packages/html/src/index.ts"),
        "@markvis/react": resolve(repoRoot, "packages/react/src/index.ts"),
      },
    },
    optimizeDeps: {
      exclude: [
        "@markvis/ir",
        "@markvis/parser",
        "@markvis/render-svg",
        "@markvis/html",
        "@markvis/browser",
      ],
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
  appearance: false,
  markdown: {
    // ```chart is the fence language. Shiki has no built-in chart grammar,
    // so register one or the dev server warns and falls back to plain text.
    languages: [
      {
        name: "chart",
        scopeName: "source.chart",
        patterns: [
          {
            match: "^[A-Za-z][\\w]*:",
            name: "entity.name.tag",
          },
        ],
      },
    ],
  },
  themeConfig: {
    siteTitle: "MarkVis",
    nav: [
      { text: "Docs", link: "/get-started" },
      { text: "Examples", link: "/examples" },
      { text: "Play", link: "/play" },
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
