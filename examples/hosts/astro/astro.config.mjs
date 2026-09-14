import remarkMarkvis from "@markvis/remark";

/** Astro markdown uses remark. No astro runtime required to read this config. */
export default {
  markdown: {
    remarkPlugins: [remarkMarkvis],
  },
};
