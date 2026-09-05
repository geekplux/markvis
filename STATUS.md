# STATUS.md

## Snapshot
- tip: 9dee6d0 then docs/pages.md env+CF HTTPS
- S1-S4 done
- S5 GitHub Pages FROM v2 (pages.yml + docs/pages.md)

GeekPlux Pages blockers: Environment github-pages must allow branch v2 (else “Branch v2 is not allowed”). Enforce HTTPS only with GitHub DNS; CF-proxied markvis.js.org → leave Enforce HTTPS off, Cloudflare SSL Full.

## Active
S5: `.github/workflows/pages.yml` on v2. `pnpm --filter web build` → `apps/web/.vitepress/dist`. CNAME markvis.js.org. GeekPlux Settings: `docs/pages.md` (Source = GitHub Actions, not master docsify). No markvis-editor. No docsify. check.yml unchanged.

## Commands
- `pnpm --filter web build` exit 0 (vitepress 1.6.4, 3.04s)
