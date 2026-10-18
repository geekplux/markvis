import rehypeMarkvis from "markvis/rehype";

// The part that matters: rehypeMarkvis in the docs plugin options.
export default {
  title: "markvis in Docusaurus",
  url: "https://example.org",
  baseUrl: "/",
  presets: [
    [
      "classic",
      {
        docs: { routeBasePath: "/", rehypePlugins: [rehypeMarkvis] },
        blog: false,
      },
    ],
  ],
};
