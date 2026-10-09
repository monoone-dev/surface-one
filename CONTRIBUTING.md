# Contributing to SurfaceOne

1. Open an issue or discuss the change first for anything non-trivial.
2. Branch from `main` as `<type>/<kebab-slug>` and keep the change focused. Follow `AGENTS.md`.
3. Commit with Conventional Commits (`<type>(<scope>): <subject>`, lowercase, ≤ 100 characters).
   No AI attribution of any kind. The git hooks check both — never bypass them.
4. Make sure `npm run build` and `npm run test:a11y` are green.
5. Open a PR against `main` using the template: one short line per real change.
   A code owner (@JakubGawr or @Lukas9315) must approve it.

The full recipe is the `pr-description` skill in `.agents/skills/pr-description/SKILL.md`.
