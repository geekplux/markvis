# PALETTES — U5 color axis (authoritative)

Named language: **Lattice**. Second axis beside theme grammar (`THEMES.md`).
`palette=` replaces **series / categorical fills+strokes only**. Margins, ticks, legend placement, radius, grid stay with the theme.

## Observation

Theme packs already ship a default `PALETTE[]` (folio blue-first, HC demo hues, …). U5 needs five **named** overrides so Play / examples detail can swap color without swapping grammar.

## Judgment

Five packs, eight series each (wrap at `WRAP_OPACITY` like themes). Mid-luminance hex so fills read on both light cream and dark `--site-page` (transparent plots). No structure/ink tokens here.

## Hex lock (series 0…7)

| id | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **ink** | `#2A2F2A` | `#5C6560` | `#8A9188` | `#3D4A5C` | `#6B5A4E` | `#4A5C54` | `#7A6E62` | `#4E5560` |
| **porcelain** | `#5B7C99` | `#8FA3B0` | `#6A8F8A` | `#9AA4B2` | `#7B8FA6` | `#A8B4BC` | `#6E7F8E` | `#B0BEC5` |
| **warm** | `#C45C26` | `#D4892A` | `#B33A2B` | `#E0A05A` | `#9C4A2F` | `#C97B4A` | `#A65D3A` | `#D4A574` |
| **cool** | `#2F6F8F` | `#3D8B8C` | `#4A6FA5` | `#5B9AA8` | `#3A5F7A` | `#6B8FB8` | `#2E7A6E` | `#7A9BB0` |
| **vivid** | `#E11D48` | `#2563EB` | `#16A34A` | `#D97706` | `#9333EA` | `#0891B2` | `#EA580C` | `#4F46E5` |

Omit `palette=` → theme’s own default `PALETTE` (unchanged).
Unknown id → `E_UNKNOWN_PALETTE` + this table (Architect).

## Names (frozen)

`ink` · `porcelain` · `warm` · `cool` · `vivid` — no aliases.

## Acceptance

- Module exports exactly these five arrays; theme grammar untouched when palette set.
- Snapshots: `01-bar` × (`folio`+`ink`, `folio`+`vivid`, `highcharts`+`ink`) — same axes/legend, different fills.
- Play + examples detail: two controls (Theme / Color).

@Coder drop into the palette module as-is.
