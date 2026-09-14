---
title: Get started
pageClass: folio-docs
sidebar: true
---

# Get started

A **fence** is a Markdown code block tagged `chart`. The numbers live in that block. MarkVis draws the picture. You do not need any other jargon.

Four ways in. Pick one.

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

If the page already runs JavaScript, drop in one file. After it loads, it finds code blocks tagged `chart` / `markvis` / `vis` and replaces them with the same picture as on the server. No extra network.

```html
<script type="module" src="./markvis.min.js"></script>
```

After `pnpm build`, copy `dist/markvis.min.js`. Packed install: `node_modules/markvis/dist/markvis.min.js`. Demo page: `apps/playground/dropin.html`.

## Ask an AI (Skill)

Give an agent the Skill or the short brief. It should write the Markdown block — not a screenshot, not a seventh chart kind.

- Skill: [skills/markvis/SKILL.md](https://github.com/geekplux/markvis/blob/master/skills/markvis/SKILL.md)
- Brief: [/llms.txt](/llms.txt) — fetch that URL; emit only the fields it lists

Next: [Integrate](/integrate) · [Spec](/spec) · [Themes](/themes) · [AI](/ai)
