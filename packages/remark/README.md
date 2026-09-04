# @markvis/remark

Thin remark plugin. `chart` / `markvis` / `vis` fences (and the HTML comment form) become a `<figure>` with SVG + data table. Invalid charts keep the table and one error line.

```js
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkMarkvis from "@markvis/remark";

const html = String(
  await remark()
    .use(remarkMarkvis)
    .use(remarkHtml, { sanitize: false })
    .process(markdown),
);
// html contains <svg> and <table>
```

No extra types. No d3. Same parser and render-svg as the CLI.
