import { unified } from "@astrojs/markdown-remark";
import rehypeMarkvis from "markvis/rehype";

// Astro 7: remark/rehype plugins need `npm install @astrojs/markdown-remark`.
// Shiki must skip chart blocks, or it rewrites them before rehypeMarkvis runs.
export default {
  markdown: {
    processor: unified({ rehypePlugins: [rehypeMarkvis] }),
    syntaxHighlight: { type: "shiki", excludeLangs: ["chart", "markvis", "vis"] },
  },
};
