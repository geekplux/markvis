Streamdown 2.7.0 with React 19.3.1, checked with `npm install && npm run build`.

# Streamdown

Streamdown takes custom code-block renderers in `plugins.renderers`. One renderer draws `chart`, `markvis`, and `vis` blocks with `markvis/react`:

```jsx
import { Streamdown } from "streamdown";
import { Markvis } from "markvis/react";

const renderers = [
  {
    language: ["chart", "markvis", "vis"],
    component: ({ code, isIncomplete }) => <Markvis source={code} streaming={isIncomplete} />,
  },
];

<Streamdown plugins={{ renderers }} isAnimating={isStreaming}>
  {reply}
</Streamdown>;
```

Streamdown matches `language` exactly, so list every spelling you expect; a ` ```Chart ` fence is not routed to the renderer and falls back to the plain code block.

`renderer.mjs` is the same renderer without JSX.

## Streaming

While `isAnimating` is true, Streamdown hands the renderer the text of an unclosed block so far, with `isIncomplete: true`. `streaming={isIncomplete}` makes that block show "Drawing chart…" and the whole rows so far instead of an error line; the last line waits, since it may be a row cut in half. The chart draws when the closing fence arrives or the reply ends.

## Colors

The chart reads `--markvis-*` CSS variables with fixed colors as fallbacks. In an app whose theme sets `--foreground`, `--muted-foreground`, and `--background`:

```css
:root {
  --markvis-ink: var(--foreground);
  --markvis-muted: var(--muted-foreground);
  --markvis-grid: var(--foreground);
  --markvis-paper: var(--background);
  --markvis-plate: var(--background);
  --markvis-plot: var(--background);
}
```

`--markvis-grid` takes the text color: grid lines are drawn faint, so a pale border color would vanish.

## Run it

The published package is `markvis@^2.2.0`. Until it is on npm, this recipe installs the tarball packed from this repository:

```bash
pnpm install && pnpm build && npm pack --ignore-scripts && mv markvis-*.tgz markvis.tgz   # from the repository root
cd examples/hosts/streamdown
npm install && npm run build
```

`build.mjs` renders `examples/valid/01-bar-basic.md`, `examples/invalid/01-unknown-type.md`, and the valid reply cut off inside its block through `<Streamdown>` on the server, then writes `dist/index.html`. It fails unless:

- the valid page has `<svg` and `data-chart-type="bar"`;
- the invalid page has `markvis-error` and `<table`;
- the cut-off page has "Drawing chart…" and no `markvis-error`.
