# GitHub Pages (GeekPlux)

Public site is VitePress at `apps/web`, built from branch **v2**. It replaces the master docsify site on **markvis.js.org**. Workflow: `.github/workflows/pages.yml` (`pnpm --filter web build`, upload `apps/web/.vitepress/dist`).

Do not change **markvis-editor.js.org** or the markvis-editor repo.

## Settings flips (one-time)

On **github.com/geekplux/markvis** → **Settings** → **Pages**:

1. **Build and deployment → Source:** GitHub Actions.  
   Not “Deploy from a branch”. Master `docs/` docsify must not stay the source.
2. **Custom domain:** `markvis.js.org` (keep existing DNS). Check **Enforce HTTPS**.
3. First green `pages` run on `v2` publishes. Until Source is GitHub Actions, the workflow uploads but GitHub still serves the old branch site.

DNS for `markvis.js.org` already pointed at GitHub Pages for docsify; leave it. `apps/web/public/CNAME` ships `markvis.js.org` in the artifact.

## Not this repo

- markvis-editor Pages / markvis-editor.js.org: untouched.
- `check.yml` stays the CI contract. This workflow only deploys the site.
- No docsify in `packages/` or `apps/`.
