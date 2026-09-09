# DOCS — Field family

Spec, Integrate, AI, Themes. Same site as `/`. Not a second theme. Not VitePress blue on a white bar under a yellow home.

Measured from shipped `apps/web/.vitepress/theme/site.css` on `f47e651`: nav height `52px`, page `#FFFFFF`, accent `#2563EB`, links `13px/500` `#64748B`. Home nav is field `#FFDB2A`, height `72px`, radius `0`, no blue.

## Instruction — Coder

One nav on every docs route. Do not restyle chart marks. Do not paint the doc body yellow.

Shared chrome, locked:

| role | value |
| --- | --- |
| nav field | `#FFDB2A` |
| ink | `#080B08` |
| paper | `#EDEBE5` |
| page | `#FFFFFF` |
| rule | `rgba(8,11,8,0.28)` |
| radius | `0` |
| shadow | none |
| accent blue | none |

1. Nav matches home. Height `72px`. Field behind the bar. Wordmark `markvis` `16px/400` ink, not uppercase. Links Docs, Examples, Play, AI: `11px` mono uppercase, tracking `.12em`, min-height `44px`. Playground action fill ink, text field, height `48px`.
2. At `390`, links collapse to one menu trigger height `44px`. Same as home.
3. Doc body stays `#FFFFFF`. Sidebar allowed. Sidebar bg `#FFFFFF`, width unchanged. Active item: ink, `1px` underline, no blue fill.
4. Headings ink `#080B08`. Body `#080B08`. Quiet `#979D97`. Links ink, underline offset `3px`. No `#2563EB`.
5. Code blocks: bg `#F4F4F5`, ink, radius `0`. Copy-paste blocks on Integrate stay four fences plus the Skill paragraph. Do not redesign the words.
6. Focus: `2px` ink outline, offset `2px`.

Delete on docs routes:

- White `52px` nav bar.
- `#2563EB` links, buttons, focus.
- `#F7F4EF`.

## Acceptance

- `/spec`, `/integrate`, `/ai`, `/themes` share the yellow home nav.
- The article is white. No yellow wash behind the sidebar.
- No blue. Radius `0` on nav, chips, and code blocks.
