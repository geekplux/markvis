# @markvis/react

React component for one chart block, plus react-markdown components and a streaming remark plugin. Published as `markvis/react`; `react` 18 or later is an optional peer of `markvis`.

```jsx
import Markdown from "react-markdown";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "markvis/react";

<Markvis source={blockText} />
<Markvis chart={{ type: "bar", x: "month", y: "revenue" }} data={rows} />
<Markdown remarkPlugins={streaming ? [remarkMarkvisStreaming] : []} components={markvisComponents}>
  {reply}
</Markdown>
```

The HTML inside the wrapper is `render().html`, so a bad block keeps its rows and shows one error line. Width follows the container. See `docs/integrate.md`.
