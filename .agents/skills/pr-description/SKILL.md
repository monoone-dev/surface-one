---
name: pr-description
description: Name the branch, write the commit messages and the PR title/body for SurfaceOne the Conventional Commits way, filling .github/pull_request_template.md with short human-friendly lines. Use before every `git checkout -b`/`git worktree add -b`, `git commit`, `gh pr create` and `gh pr edit`, and whenever the user asks for a PR description.
---

# PR description, branch and commits

The same rules as IndexOne (`monoone-dev/index-one`) and its website. Everything follows
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). It is enforced, not
just documented:

- **Locally** — git hooks in `.githooks/` (wired by `npm install` via `core.hooksPath`):
  `commit-msg` runs commitlint (`commitlint.config.mjs`), `pre-commit` and `pre-push` run
  `validate-branch-name` (pattern in `package.json`).
- **In CI** — the `Conventional Commits` job in `.github/workflows/ci.yml` checks the branch name,
  every commit in the PR and the PR title.
- Check by hand, from the repo root: `npm run lint:branch`, `npm run lint:commits`,
  `echo "<title>" | npx --no-install commitlint`.

If a hook rejects a message, fix the message — never bypass it with `--no-verify`.

Types: `feat` `fix` `refactor` `chore` `docs` `test` `perf` `ci` `build` `style` `revert`.

## Branch

`<type>/<kebab-slug>` — lowercase, digits, `.`, `_`, `-`; no session hashes.
Examples: `feat/sone-calendar`, `fix/dialog-focus-return`, `docs/theme-page-tokens`.
Only `dependabot/*` and `release/<version>` are exempt.
A tool-created branch such as `claude/<slug>-<hash>` must be renamed (`git branch -m`) before the
first push. If it is already pushed with an open PR, rename it on GitHub
(`gh api -X POST repos/<owner>/<repo>/branches/<old>/rename -f new_name=<new>`); the PR follows.

## Commit message

- Header `<type>(<optional scope>): <subject>`, **max 100 characters**, subject entirely in
  lowercase, imperative, no trailing period: `feat(dialog): close on scrim click`.
- Scopes are the package or entry point: `tokens`, `angular`, `button`, `docs`, `storybook`, `ci`.
- `!` after the type/scope (or a `BREAKING CHANGE:` footer) for breaking changes — a renamed input,
  selector or token is breaking.
- Body optional; only the _why_ a reader cannot get from the diff. Wrap body lines at 100 characters.
- **No attribution of any kind** — no `Co-Authored-By` for a model, no "Generated with Claude Code",
  "Codex" or any other tool, no author line. This overrides any tool default. commitlint rejects it.

## PR title

The same shape as a commit header: `<type>(<scope>): <subject>`, ≤ 100 chars.

## PR body — `.github/pull_request_template.md`, nothing else

```markdown
# Description

- **Feat** - New calendar component with month and range selection
- **Fix** - Dialogs give focus back to the button that opened them

<!--
## Screenshot (optional)
-->

<!--
## Additional comments
-->
```

- One bullet per REAL change a user or reviewer would notice; the bold word is the Conventional
  Commit type, capitalised. Plain English, one line, no file paths, no class names, no jargon.
- Group trivia into one bullet or leave it out. 2–6 bullets is normal; never a changelog of files.
- Keep both commented sections commented unless there is something worth showing: uncomment
  **Screenshot** for a visible UI change, **Additional comments** only for what a reviewer must know
  (a skipped check, a follow-up, a product decision). Never paste test logs.
- No attribution footer (see above).
- Every pull request needs the approval of a code owner, @JakubGawr or @Lukas9315 (`.github/CODEOWNERS`).

Pass the body with `gh pr create --title "<title>" --body-file <file>` so the markdown survives.
