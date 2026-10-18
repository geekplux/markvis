# react-markdown host

A chat-style page that streams a reply containing a chart, plus the two other ways to use `markvis/react`: block text and a chart object with rows.

No build step. React and react-markdown load from a CDN through an import map; `markvis/react` loads from this repository's `dist/`.

```bash
pnpm build
python3 -m http.server 8000   # from the repository root
# open http://localhost:8000/examples/hosts/react-markdown/
```

In an app, install the packages and import the same names:

```bash
npm install markvis react react-dom react-markdown
```

```jsx
import Markdown from "react-markdown";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "markvis/react";
```

While the reply streams, the chart block shows "Drawing chart…" and the rows that have arrived. It draws when the closing fence arrives. `main.js` leaves `remarkMarkvisStreaming` out once the reply is complete.
