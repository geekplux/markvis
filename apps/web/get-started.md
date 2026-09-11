---
title: Get started
pageClass: folio-docs
sidebar: true
---

# Get started

Four ways in. Pick one and ship a figure.

## Play (30 seconds)

Open [Play](/play). Paste a fence. The SVG updates on the right. Same text, same figure.

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

Browse finished figures in [Examples](/examples). Open one in Play to edit.

## Bake

Keep the fence in the Markdown file. Write an SVG next to it and insert an image so any viewer shows the figure — including hosts that never run a plugin.

```bash
pnpm markvis bake README.md
```

Second bake is a no-op when nothing changed. The fence stays; the image follows it.

## Script

Where the host already runs JavaScript, drop in the one-file browser build. Zero network after load. It finds `pre` / `code` with language `chart`, `markvis`, or `vis` and replaces them with the same SVG as Node.

```html
<script type="module" src="./markvis.min.js"></script>
```

Build `@markvis/browser` in this monorepo first (`packages/browser/dist/` is gitignored). Demo page: `apps/playground/dropin.html`.

## Skill

Point an agent at the Skill or the public brief. It emits a fence — not a PNG, not a seventh type.

- Skill: [skills/markvis/SKILL.md](https://github.com/geekplux/markvis/blob/v2/skills/markvis/SKILL.md)
- Brief: [/llms.txt](/llms.txt) — fetch that URL; emit only the fields it lists

Next: [Integrate](/integrate) · [Spec](/spec) · [Themes](/themes) · [AI](/ai)
