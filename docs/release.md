# Release and merge

How v2 becomes the default branch **without** dropping GitHub contribution-graph days.

GitHub counts commits that are **reachable from the default branch**. This repo’s default branch is `master` (`origin/HEAD`). There is no `main`. Do not rename `master`.

## Merge (required method)

On a machine with push access to `github.com/geekplux/markvis`:

```bash
git fetch origin
git checkout master
git merge --no-ff v2 -m "Merge branch 'v2'"
git push origin master
```

That creates a merge commit. Historic `v2` SHAs stay reachable from `master`. 2017 commits on `master` stay reachable. Contribution-graph days for those commits survive.

## Forbidden

- Squash-merge of `v2` into `master` (collapses 2026 work onto one day)
- Rebase onto an orphan root / `git checkout --orphan`
- `git filter-repo` or history rewrite
- `git push --force` to `master`
- Publishing `markvis@2.0.0` as npm `latest` in this step (`latest` is still `0.0.13`)

## After the merge

1. GitHub **Settings → General → Default branch** stays `master`.
2. **Settings → Pages → Source:** GitHub Actions (not “Deploy from a branch”).
3. **Settings → Environments → github-pages → Deployment branches:** allow `master` (and `v2` until you delete that branch).
4. Confirm a green `pages` workflow on `master` for markvis.js.org. Do not touch markvis-editor.js.org.
5. Proof:

   ```bash
   git merge-base --is-ancestor <v2-sha-before-merge> master
   git log --oneline master | head
   ```

This tree is `markvis@2.0.0`. Publishing `latest` replaces `0.0.13` for npm users (the old renderer stays in `legacy/`). This unit does not run `npm publish`.

Until that merge, `pages.yml` and `bake.yml` still fire on `v2` so markvis.js.org does not go dark.

## CI after merge

`.github/workflows/check.yml` already runs on `master`. `pages.yml` and `bake.yml` deploy/bake from `master` (and from `v2` until it is retired).
