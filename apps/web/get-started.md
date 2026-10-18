---
title: Get started
pageClass: folio-docs
sidebar: true
---

# Get started

A **fence** is a Markdown code block tagged `chart`. The numbers live in that block. MarkVis draws the picture. You do not need any other jargon.

Five ways in. Pick one.

## Try it (no install)

Open [Play](/play). Paste this block. The chart appears on the right. Change a number — the picture updates.

```chart
markvis: 2
type: bar
title: Feb led Q3 at 180
unit: USD k
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```

Browse finished pictures in [Examples](/examples). Open one in Play to edit.

## Save a picture (bake)

GitHub and many viewers will not draw the code block by themselves. `bake` writes a picture file next to your Markdown and adds an image so they can show it. The code block stays in the file.

```bash
npm install markvis
npx markvis bake README.md
```

Running bake again does nothing if nothing changed. **2.0.0 replaces 0.0.13.**

## Put it on a web page (script)

One `<script>` in the page, or in the Markdown file itself. Once the page is ready, every code block tagged `chart` / `markvis` / `vis` becomes a chart. Nothing else to install.

```html
<script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"></script>
```

Works wherever Markdown becomes HTML and the page may run a script: Jekyll, Hugo, MkDocs, docsify, plain HTML. Not on github.com, where scripts are stripped; bake a picture there. Content that arrives later, such as a chat reply: `markvis.init(element)`. Details: [Integrate](/integrate).

## Use it in your own app (JavaScript, React)

One call draws one block. It never throws: a wrong block comes back as its rows and one error line.

```js
import { render } from "markvis";

element.innerHTML = render(blockText).html;
```

In React, `import { Markvis } from "markvis/react"` and write `<Markvis source={blockText} />`. For react-markdown there is a `components` map that also handles a reply while it streams. Details: [Integrate](/integrate).

## Ask an AI (Skill)

Give an agent the Skill or the short brief. It should write the Markdown block — not a screenshot, and not an invented type id.

- Skill: [skills/markvis/SKILL.md](https://github.com/geekplux/markvis/blob/master/skills/markvis/SKILL.md)
- Brief: [/llms.txt](/llms.txt) — fetch that URL; emit only the fields it lists

Next: [Integrate](/integrate) · [Spec](/spec) · [Themes](/themes) · [AI](/ai)
