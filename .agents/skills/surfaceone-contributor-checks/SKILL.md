---
name: surfaceone-contributor-checks
description: Use when changing or reviewing Surface One producer-side tokens, framework parity or accessibility; selects existing source checks without depending on consumer skill symlinks.
---

Read AGENTS.md and the affected package source. Tokens are defined in packages/tokens; semantic roles, themes and generated native values must stay aligned. Check actual token names in source, not copied examples. Use existing generation scripts from package.json rather than hand-editing generated values.

For the requested component compare Angular, Vue, React and React Native public APIs, controlled/uncontrolled behavior, SSR, keyboard/focus, names/labels, semantics and contrast in its supported themes. Use the affected build/test scripts from package.json. Changes to styles use npm run lint:styles; docs use npm run typecheck. Check the affected docs and Storybook view; npm run test:a11y applies when the built site is ready. MCP/reference changes use npm run ai:build and npm run test:mcp. Add no tests unless explicitly requested; full gates and publication are release-only.

Reviewers stay look-only: record failures for the implementer, never repair the source or generated artifacts. Browser a11y evidence does not prove real native-device behavior. Consumer-facing skills under packages/skills have a separate distribution purpose; this skill is for repository maintenance.
