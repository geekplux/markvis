# GitHub Pages (GeekPlux)

Public site is VitePress at `apps/web`, built from branch **v2**. It replaces the master docsify site on **markvis.js.org**. Workflow: `.github/workflows/pages.yml` (`pnpm --filter web build`, upload `apps/web/.vitepress/dist`).

Do not change **markvis-editor.js.org** or the markvis-editor repo.

## Settings flips (one-time)

On **github.com/geekplux/markvis** → **Settings** → **Pages**:

1. **Build and deployment → Source:** GitHub Actions.  
   Not “Deploy from a branch”. Master `docs/` docsify must not stay the source.
2. **Custom domain:** `markvis.js.org` (keep existing DNS).
3. First green `pages` run on `v2` publishes. Until Source is GitHub Actions, the workflow uploads but GitHub still serves the old branch site.

### Environment `github-pages` (required or deploy fails)

The Actions deploy job uses the **github-pages** environment. Under **Settings** → **Environments** → **github-pages** → **Deployment branches and tags**:

- Must **allow branch `v2`** (or “All branches”, or a rule that includes `v2`).
- If the allow list is only `master` / `main` / `gh-pages`, the run fails with: **Branch v2 is not allowed to deploy to github-pages**.

Fix: add `v2` to that list. Do not switch Pages Source off GitHub Actions.

### Enforce HTTPS vs Cloudflare

**Enforce HTTPS** on the Pages custom-domain screen only works when GitHub sees its own DNS for the domain (GitHub Pages nameservers / apex A + `www` CNAME as GitHub documents).

If `markvis.js.org` is **Cloudflare-proxied** (orange cloud):

- Leave **Enforce HTTPS unchecked** in GitHub Pages. GitHub cannot issue/complete HTTPS for a proxied record; checking it fails or never turns green.
- In Cloudflare: SSL/TLS mode **Full** (not Flexible). Proxied CNAME/A to GitHub Pages; Cloudflare terminates visitor HTTPS.

If DNS is **grey-cloud / DNS-only** to GitHub Pages, Enforce HTTPS can stay on.

DNS for `markvis.js.org` already pointed at GitHub Pages for docsify; leave the names unless you are changing proxy. `apps/web/public/CNAME` ships `markvis.js.org` in the artifact.

## Not this repo

- markvis-editor Pages / markvis-editor.js.org: untouched.
- `check.yml` stays the CI contract. This workflow only deploys the site.
- No docsify in `packages/` or `apps/`.
