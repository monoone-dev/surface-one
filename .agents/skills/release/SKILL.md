---
name: release
description: Release Surface One — bump the shared version, write the release notes in every locale, tag, and let the Release workflow publish @surface-one/tokens, @surface-one/angular, @surface-one/angular-mcp and @surface-one/skills to npm. Use for any version bump, publish, npm or GitHub release task.
---

# Releasing Surface One

All four packages share one version and are released together by `.github/workflows/release.yml`
(npm with provenance + a GitHub release). Semver: a renamed input, selector, token or entry point is
a major change; a new component or input is minor; fixes are patch.

## Steps

1. Branch `chore/release-x-y-z` from `main`.
2. `node scripts/release-version.mjs x.y.z` — sets every `package.json`, the tokens peer range,
   the docs site version and the `VERSION` constant.
3. Release notes: add `{ version: "x.y.z", date: "YYYY-MM-DD" }` at the top of `RELEASES` in
   `apps/docs/src/app/pages/release/release.page.ts` and `release.entries["x.y.z"]` in all nine
   locale files (`docs-i18n` skill).
4. `npm run typecheck && npm run build:site && npm run test:a11y && npm run test:mcp`.
5. Commit `chore(release): x.y.z`, open the PR (`pr-description` skill), get a code-owner review,
   merge.
6. Tag the merge commit on `main`: `git tag vx.y.z && git push origin vx.y.z`. The workflow
   re-runs CI, checks every version equals the tag, builds, publishes (already-published versions
   are skipped, so a re-run is safe) and creates the GitHub release.

A dry run: Actions → Release → Run workflow (dry run on). A pre-release: version `x.y.z-next.1` and
dist-tag `next` from the manual run.

## One-time npm setup (maintainers)

- The `@surface-one` organisation on npmjs.com, with JakubGawr and Lukas9315 as owners.
- Preferred: npm **trusted publishing** for each package → GitHub repository
  `monoone-dev/surface-one`, workflow `release.yml`, environment `npm`. No secret needed.
- Until then: an npm granular token with publish rights on `@surface-one`, stored as the
  repository secret `NPM_TOKEN`.
