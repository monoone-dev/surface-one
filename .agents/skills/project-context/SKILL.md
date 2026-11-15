---
name: project-context
description: Use before planning, changing or verifying Surface One design system; explains domain, architecture, commands and verification boundaries.
---

# Surface One design system

Read this repository AGENTS.md first; workspace git policy and current owner instructions take precedence. Read the relevant project card, then confirm paths and commands in source.

npm workspace: packages/tokens, angular, vue, react, react-native, core, angular-mcp and skills; apps/docs and Angular Storybook. Read existing add-component and framework consumer skills before implementation.

npm start serves docs; npm run storybook serves Storybook. Shared tokens and markup/a11y semantics must agree across framework twins. Use package.json and scripts/lib/packages.mjs for current package identities; do not infer publication targets from stale docs.

Use the affected framework build/test scripts from package.json, npm run typecheck for docs, npm run lint:styles for style changes, npm run ai:build and npm run test:mcp for MCP/reference changes. Check visible docs/Storybook and keyboard/a11y for UI changes.

No manual version bump or npm publish during a task. Preserve package API compatibility and generated references. This repository is public: no private consumer code, internal links, credentials or personal paths.

Add tests only when explicitly requested. Run narrow checks for the change; full gates, version bumps and releases belong only to an owner-requested release. Report exact revision and distinguish static checks, mocked runtime, native runtime and production evidence.
