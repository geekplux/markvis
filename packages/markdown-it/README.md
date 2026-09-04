# @markvis/markdown-it

Thin markdown-it plugin. `chart` / `markvis` / `vis` fences (and the HTML comment form) become a `<figure>` with SVG + data table. Invalid charts keep the table and one error line.

```js
import MarkdownIt from "markdown-it";
import markdownItMarkvis from "@markvis/markdown-it";

const html = new MarkdownIt({ html: true })
  .use(markdownItMarkvis)
  .render(markdown);
// html contains <svg> and <table>
```

VitePress: `markdown.config(md) { md.use(markdownItMarkvis) }`. No extra types. No d3.
