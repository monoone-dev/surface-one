---
name: release
description: Release Surface One — the release-please PR, the generated CHANGELOG.md and the docs Changelog page, then the Release workflow that publishes @surface-one/tokens, @surface-one/angular, @surface-one/vue, @surface-one/angular-mcp and @surface-one/skills to GitHub Packages and npm. Use for any version bump, changelog, publish, npm or GitHub release task.
---

# Releasing Surface One

All five packages share one version. The version and `CHANGELOG.md` are computed from the
Conventional Commits on `main` by [release-please](https://github.com/googleapis/release-please)
(`release-please-config.json`, `.release-please-manifest.json`) in
`.github/workflows/release.yml`. Nobody bumps a version or writes release notes by hand.

## How a version is chosen

| Commits since the last release                      | Bump                                   |
| --------------------------------------------------- | -------------------------------------- |
| `fix:` / `perf:`                                    | patch                                  |
| `feat:`                                             | minor                                  |
| `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer   | major (minor while the version is 0.x) |
| only `chore` / `ci` / `build` / `test` / `refactor` | no release                             |

A renamed input, selector, token or entry point is breaking: mark the commit with `!` and explain the
migration in a `BREAKING CHANGE:` footer — that text lands in the changelog. Since PRs are
squash-merged, the PR title is the commit that counts (`pr-description` skill).

## Steps

1. Merge PRs to `main` as usual. Every push updates the open release PR
   `chore(release): x.y.z` (branch `release-please--branches--main`): `CHANGELOG.md`, the root
   `package.json` and the manifest, and — via `scripts/release-version.mjs` — every package, the
   tokens peer range, `package-lock.json`, the docs site version and the `VERSION` constant.
2. Review the release PR. To edit the notes, edit the merged PR titles/bodies or add commits; to
   force a version, add `Release-As: x.y.z` to a commit body.
3. Merge the release PR (code-owner review). The workflow tags `vx.y.z`, creates the GitHub release
   with the changelog section, re-runs CI, checks every version equals the tag and publishes to
   GitHub Packages, then to npm once npm is set up (already-published versions are skipped, so a
   re-run is safe). `scripts/publish-packages.mjs --registry github|npm` does the publishing.
4. The docs deploy rebuilds `/changelog` from `CHANGELOG.md` (`scripts/build-changelog.mjs`); the MCP
   server reads the same entries (`get_docs`, `/docs/angular/releases/v…`).

The changelog page is English only (a note says so in the other eight locales); its intro copy is
`changelog` in `apps/docs/src/app/i18n/messages/*.ts`.

A dry run: Actions → Release → Run workflow (dry run on). A pre-release: version `x.y.z-next.1` set
with `node scripts/release-version.mjs`, a tag pushed by hand, and dist-tag `next` from the manual
run.

## One-time setup (maintainers)

- Settings → Actions → General: allow GitHub Actions to create and approve pull requests.
- `RELEASE_PLEASE_TOKEN`: a fine-grained PAT (or GitHub App token) with contents and pull-requests
  write. Without it the release PR is opened with `github.token`, and GitHub runs no CI on it.
- The `npm` environment must allow deployments from `main` (the publish runs on the merge push).

### GitHub Packages

Nothing to set up: the workflow publishes with `github.token` (`packages: write`), and the packages
are linked to the repository, so they inherit its visibility. GitHub only accepts the owner's scope,
so `@surface-one/<name>` is published as `@monoone-dev/surface-one-<name>` — the rename happens in
`publish-packages.mjs` for the publish only; the source keeps `@surface-one/*`. Consumers install
them under npm aliases (README → _Install from GitHub Packages_).

### npm (optional until enabled)

Without `NPM_TOKEN` or `NPM_PUBLISH=true` the npm step is skipped with a notice.

- The `@surface-one` organisation on npmjs.com, with JakubGawr and Lukas9315 as owners.
- Preferred: npm **trusted publishing** for each package → GitHub repository
  `monoone-dev/surface-one`, workflow `release.yml`, environment `npm`. No secret needed; set the
  repository variable `NPM_PUBLISH=true` to turn the npm step on.
- Until then: an npm granular token with publish rights on `@surface-one`, stored as the
  repository secret `NPM_TOKEN`.
