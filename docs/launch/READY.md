# Launch ready

Checklist for GeekPlux. Tick in a browser against live URLs. **Not** the launch itself.

Tip when drafted: `668ffd6` (branch `v2`). Verifier re-ticks evidence; PM signs last.

Do **not** post Show HN. Do **not** flip the default branch.

## Live

- [ ] https://markvis.js.org/play — edit fence → SVG changes
- [ ] https://markvis.js.org/ — what / who / start visible
- [ ] https://markvis.js.org/examples — four themes visible (folio · highcharts · shadcn · docs)
- [ ] 390px on `/` `/play` `/examples` — no horizontal page overflow

## Ship gates

- [ ] CI badge green on `v2` (README Actions badge for `check`)
- [ ] `v2` README reads as an HN landing (one sentence, play URL, three SVGs, badge)
- [ ] `docs/launch/SHOW_HN.md` and `docs/launch/TWEET.md` exist
- [ ] `rg -i mermaid` on public site sources is empty (`apps/web`, `docs/site-copy.md`, `README.md`)
- [ ] Registry latest tag stays on frozen 0.0.13 (no 2.x publish)
- [ ] Default branch is still `master`

## Acceptance commands

Run on branch v2:
- git rev-parse --abbrev-ref HEAD equals v2
- suite tests green
- valid examples check ok
- invalid examples check non-zero
- packages/themes/folio present
- issue bug template present
- this READY file present
- no competitor diagram names in public site sources

## Pages deploy gate

pages.yml does not deploy a red build: shared check via workflow_call; Pages build job needs check.

## Sign-off

| Role | Sign | When |
| --- | --- | --- |
| Verifier | signed 2026-09-06 | tip 9f746fa; live + suite evidence |
| PM | signed 2026-09-06 | after Verifier; summary in channel; stop |
| GeekPlux | | Browser tick before any public launch |

No Show HN from this file. No branch flip from this file.
