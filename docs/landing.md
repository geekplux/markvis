# markvis

Quantitative charts in Markdown. The fence is the data.

Mermaid owns structure (flow, sequence, state). markvis owns numbers: bar, line, area, scatter, pie, hist from CSV or a GFM table. Same source renders SVG and keeps the table for readers without a plugin.

## Try it

1. Open apps/playground (Vite try page) and paste a fence, or pick an examples/valid seed.
2. Or: markvis check examples/valid — then markvis render on one file.
3. Skill trigger: skills/markvis/SKILL.md. Short model brief: llms.txt.

## Sample SVGs

- examples/out/01-bar-basic.svg
- examples/out/02-line-multi.svg
- examples/out/05-pie-raw.svg

## Boundaries

Six types only. No JSON-as-default data. Invalid fences degrade to table plus one error line — data does not disappear. Old 0.0.13 tree lives under legacy/.

See SPEC.md, docs/best-practices.md, and examples/prompts.md.
