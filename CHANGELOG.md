# Changelog

Every release of `@surface-one/tokens`, `@surface-one/angular`, `@surface-one/angular-mcp` and
`@surface-one/skills`, newest first. The four packages share one version. This file is written by
[release-please](https://github.com/googleapis/release-please) from the Conventional Commits on
`main` — do not edit released sections by hand.

## [0.3.0](https://github.com/monoone-dev/surface-one/compare/v0.2.0...v0.3.0) (2026-10-09)


### ⚠ BREAKING CHANGES

* **angular:** the --note-drawer-w token is replaced by --side-panel-w.

### Features

* **angular:** sync the components with the latest index-one design system ([aaa6541](https://github.com/monoone-dev/surface-one/commit/aaa654198d0ddc75ae22362593fab71b5ee5e05c))


### Documentation

* **storybook:** replace the indexone example copy in stories with neutral text ([2d3a534](https://github.com/monoone-dev/surface-one/commit/2d3a53400afcb42fb13a398ba13cab7f8ba4bbfa))

## [0.2.0](https://github.com/monoone-dev/surface-one/compare/v0.1.0...v0.2.0) (2026-10-08)


### Features

* add the surface one design system, docs site, mcp server and release pipeline ([b6b7534](https://github.com/monoone-dev/surface-one/commit/b6b75346ec1cfdcdb77896ea912a69f7adfcb82e))
* **ai:** add the surface one mcp server and agent skills for claude, codex and copilot ([9a6fabb](https://github.com/monoone-dev/surface-one/commit/9a6fabbde0f5a822ec2c5e3edded53880221e4ae))
* **angular:** add @surface-one/angular with every index-one component as sone- ([9896b02](https://github.com/monoone-dev/surface-one/commit/9896b023cad03eca3cc3c3fe871e5739d83b9eff))
* **docs:** add the prerendered documentation site in nine languages ([7421053](https://github.com/monoone-dev/surface-one/commit/74210532ab9de658d683f44caaec6bd90cbbf2a0))
* **docs:** generate the changelog and versions with release-please ([99fa9b8](https://github.com/monoone-dev/surface-one/commit/99fa9b82e61e967b1fd4037c4b0ba4d176d9890d))
* **docs:** generate the changelog and versions with release-please ([166a2aa](https://github.com/monoone-dev/surface-one/commit/166a2aa93b9bac6175fb2a807c8f1d630dec0e15))
* **tokens:** add @surface-one/tokens with skins, accents and latin-ext fonts ([9dbbfe6](https://github.com/monoone-dev/surface-one/commit/9dbbfe6df34e7258255a923a8f91770c8711ce86))


### Bug fixes

* **docs:** serve the site from the github pages sub-path ([419c867](https://github.com/monoone-dev/surface-one/commit/419c867d1f677fb48695b1545683b528cc146d8b))
* **docs:** serve the site from the github pages sub-path ([e5fe656](https://github.com/monoone-dev/surface-one/commit/e5fe6569b805d625dd7eff365194ffcad64fd4f4))
* **repo:** add the skills workspace to the lockfile so npm ci passes ([40b7dc1](https://github.com/monoone-dev/surface-one/commit/40b7dc19f1a0397fa38a9d0b3040ff624ab6a881))


### Documentation

* **readme:** center the product logo and credit monoone ([f83a2f7](https://github.com/monoone-dev/surface-one/commit/f83a2f738dcaf91c5236d8ac59ab3ba82022463a))
* **readme:** center the product logo and credit monoone ([3233bca](https://github.com/monoone-dev/surface-one/commit/3233bca693886d1cfc30c4af9b4ce141dd5a9a44))

## [0.1.0](https://github.com/monoone-dev/surface-one/releases/tag/v0.1.0) (2026-10-05)

The first release of Surface One, the design system extracted from IndexOne.

### Features

- Every IndexOne design-system component, renamed to the `sone-` prefix and published as `@surface-one/angular` with one entry point per component.
- `@surface-one/tokens`: design tokens, Studio, Paper and Minimalist skins in light and dark, five accents and latin-ext fonts.
- Documentation site in nine languages with live demos, generated API tables and templates.
- Storybook with every component and token page.
- `@surface-one/angular-mcp` and `@surface-one/skills` for AI assistants.
