import markdownItMarkvis from "@markvis/markdown-it";

/** VitePress uses markdown-it. Wire the same plugin. */
export default {
  title: "markvis vitepress host",
  markdown: {
    config(md) {
      md.use(markdownItMarkvis);
    },
  },
};
