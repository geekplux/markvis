# Integrate

Put a figure in any Markdown preview or rendered view. Bake an SVG so any viewer shows it, or drop in a one-file script where the host already runs JavaScript. No plugin still shows the table.

## Public site

markvis.js.org is the VitePress site in apps/web, built from branch master. GitHub Pages source must be GitHub Actions (not docsify). Do not change markvis-editor.js.org. Workflow: `.github/workflows/pages.yml` (`pnpm --filter web build`, upload `apps/web/.vitepress/dist`). `check.yml` stays the CI contract; Pages only deploys the site.

## GitHub README

GitHub will not grow a native chart fence. Use markvis bake on README.md and docs/landing.md. Keeps the fence; inserts a markdown image after it. Second bake is a no-op. CI workflow bake.yml runs on master push and PR.

## Any JS preview

After `pnpm build` (or a packed install), drop in `dist/markvis.min.js` (or `.mjs`). Zero network. Finds pre/code with language chart, markvis, or vis and replaces with the same SVG as Node.

In this monorepo: `pnpm build`, then open `apps/playground/dropin.html`. `dist/` is gitignored — without that build the script 404s. Packed consumers copy `node_modules/markvis/dist/markvis.min.js`. For the live editor, start the playground Vite app.

Demo: apps/playground/dropin.html.

HTML comment plus GFM table charts only survive if the host already emitted them into the DOM; the browser script does not re-parse Markdown.

## VitePress / Astro / markdown-it / remark

| Host | Path |
| --- | --- |
| VitePress | examples/hosts/vitepress/ — wire `markvis/markdown-it` (this monorepo still imports `@markvis/markdown-it`) |
| Astro | examples/hosts/astro/ |
| markdown-it | examples/hosts/markdown-it/ + `import markdownItMarkvis from "markvis/markdown-it"` |
| remark | `import remarkMarkvis from "markvis/remark"` |

Each host example renders at least one valid fence to HTML with svg and table elements.

## VS Code

extensions/vscode-markvis-preview — Markdown preview renders chart / markvis / vis to SVG. Install from folder or vsce package. Do not publish to Marketplace unless GeekPlux says so. See that folder README.

## GitHub Pages (one-time Settings)

On **github.com/geekplux/markvis** → **Settings** → **Pages**:

1. **Build and deployment → Source:** GitHub Actions. Not “Deploy from a branch”. Docsify must not stay the source.
2. **Custom domain:** `markvis.js.org` (keep existing DNS).
3. First green `pages` run on `master` publishes. Until Source is GitHub Actions, the workflow uploads but GitHub still serves the old branch site.

### Environment `github-pages`

The Actions deploy job uses the **github-pages** environment. Under **Settings** → **Environments** → **github-pages** → **Deployment branches and tags**:

- Must **allow branch `master`** (or “All branches”, or a rule that includes `master`).
- If the allow list is only `v2` / `main` / `gh-pages`, the run fails with: **Branch master is not allowed to deploy to github-pages**.

### Enforce HTTPS vs Cloudflare

**Enforce HTTPS** on the Pages custom-domain screen only works when GitHub sees its own DNS for the domain.

If `markvis.js.org` is **Cloudflare-proxied** (orange cloud):

- Leave **Enforce HTTPS unchecked** in GitHub Pages. GitHub cannot issue/complete HTTPS for a proxied record.
- In Cloudflare: SSL/TLS mode **Full** (not Flexible). Proxied CNAME/A to GitHub Pages; Cloudflare terminates visitor HTTPS.

If DNS is **grey-cloud / DNS-only** to GitHub Pages, Enforce HTTPS can stay on.

`apps/web/public/CNAME` ships `markvis.js.org` in the artifact. pages.yml must not deploy a red build.

## Explicit non-goals

- Waiting for github.com to add native markvis fences
- Docusaurus adapter (skipped for now — use bake or the browser drop-in; MDX surface is not cheap)
- New chart types, JSON-as-default data, or d3 in packages/ or apps/
