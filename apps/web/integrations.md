---
title: Integrations
pageClass: folio-docs
sidebar: true
---

# Integrations

Every way to show a markvis block, with its status. "Available now" is in the published package; "2.2" ships in the next release. Wherever none of these run, the block stays readable text, and the comment form stays a table.

## Script tag in a page

**Available now** (2.2 finds more host shapes and the comment form).

```html
<script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"></script>
```

Draws every chart block once the page is ready. Content added later: `markvis.run()`.

## Script tag in a Markdown file

**2.2.** Put the same tag at the top or bottom of the file. Works where Markdown becomes HTML and scripts run: Jekyll and GitHub Pages sites, Hugo (raw HTML on), MkDocs (a custom fence), Hexo, Eleventy, docsify, Pandoc. Not where scripts are stripped: github.com, the default VS Code preview, Obsidian, Notion. Details: [Integrate](/integrate#_2-one-script-tag-in-a-page-or-a-markdown-file).

## JavaScript

**2.2.**

```js
import { render } from "markvis";

const { html } = render(blockText, { width: 480 });
element.innerHTML = html; // a figure, or the rows and one error line
```

## React

**2.2.**

```jsx
import { Markvis } from "markvis/react";

<Markvis source={blockText} />
<Markvis chart={{ type: "bar", x: "month", y: "revenue" }} data={rows} />
```

## react-markdown, streaming

**2.2.**

```jsx
import { markvisComponents, remarkMarkvisStreaming } from "markvis/react";

<Markdown components={markvisComponents} remarkPlugins={streaming ? [remarkMarkvisStreaming] : []}>
  {reply}
</Markdown>
```

A block still arriving shows "Drawing chart…" and its rows, never an error.

## markdown-it and VitePress

**Available now.**

```js
import markdownItMarkvis from "markvis/markdown-it";

md.use(markdownItMarkvis); // VitePress: markdown.config(md) { md.use(markdownItMarkvis) }
```

## remark

**Available now.**

```js
import remarkMarkvis from "markvis/remark";

remark().use(remarkMarkvis).use(remarkHtml, { sanitize: false });
```

## rehype, MDX, Astro

**2.2.** Real elements, no raw HTML, so MDX accepts them.

```js
import rehypeMarkvis from "markvis/rehype";

unified().use(remarkParse).use(remarkRehype).use(rehypeMarkvis).use(rehypeStringify);
```

MDX docs presets take it as a rehype plugin. Astro 7: `processor: unified({ rehypePlugins: [rehypeMarkvis] })` and Shiki `excludeLangs: ["chart", "markvis", "vis"]`.

## Command line

**Available now.**

```bash
npx markvis check notes.md     # exits non-zero if any block is wrong
npx markvis bake README.md     # writes SVG next to the file; the block stays
```

## GitHub Action

**Available now** from `master`.

```yaml
- uses: actions/checkout@v4
- uses: geekplux/markvis@master
  with: { paths: README.md docs }
```

## VS Code

**From source.** The preview extension in `extensions/vscode-markvis-preview` draws chart blocks in the Markdown preview. Install it from the folder.

## Model instruction

**Available now.** A 250-token instruction for a system prompt: [docs/prompt.md](https://github.com/geekplux/markvis/blob/master/docs/prompt.md). With it, models gave a valid block for 29 or 30 of 30 test prompts; without it, 0 to 2. The full reference is [/llms.txt](/llms.txt).

## Security

A chart block holds data only: header lines and rows. It cannot carry HTML or scripts, and markvis escapes every title, label, cell, and series name in the SVG and the table it writes. The script tag, React, and rehype paths insert only that output.
