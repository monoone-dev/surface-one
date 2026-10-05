# @surface-one/angular

Angular 22 components of the Surface One design system. Standalone, OnPush, signal inputs, zoneless
and SSR-friendly. Every element selector starts with `sone-`, every attribute directive with `sone`.

```bash
npm install @surface-one/angular @surface-one/tokens
```

Load the styles (tokens first) in `angular.json`:

```json
"styles": ["@surface-one/tokens", "@surface-one/angular/styles.css"]
```

Each component family is its own entry point, so you only bundle what you import:

```ts
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SoneDialogComponent,
  SONE_DIALOG_PARTS,
} from "@surface-one/angular/dialog";
```

Built-in strings use `$localize` — add `@angular/localize`. The markdown entry point needs the
optional peers `marked`, `dompurify` and `@codemirror/*`.

Brand marks for `<sone-logo>` ship in `@surface-one/tokens/brand`; copy them into your assets and call
`provideSoneLogoAssets("/brand/")`.
