/** Code samples shared by every locale (code is never translated). */
export const SNIPPETS: Record<string, { lang: string; code: string }> = {
  install: {
    lang: "bash",
    code: "npm install @surface-one/angular @surface-one/tokens",
  },
  installVue: {
    lang: "bash",
    code: "npm install @surface-one/vue @surface-one/tokens",
  },
  nuxtConfig: {
    lang: "ts",
    code: `modules: ["@surface-one/vue/nuxt"]`,
  },
  angularStylesLine: {
    lang: "json",
    code: `"styles": ["@surface-one/tokens", "@surface-one/angular/styles.css"]`,
  },
  angularJson: {
    lang: "json",
    code: `"styles": [
  "@surface-one/tokens",
  "@surface-one/angular/styles.css",
  "src/styles.css"
]`,
  },
  localize: {
    lang: "bash",
    code: "ng add @angular/localize",
  },
  usage: {
    lang: "ts",
    code: `import { Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

@Component({
  selector: "app-root",
  imports: [SoneButtonDirective, SoneSwitchComponent],
  template: \`
    <sone-switch [(checked)]="enabled" ariaLabel="Notifications" />
    <button soneBtn variant="outline" type="button">Save</button>
  \`,
})
export class App {
  enabled = true;
}`,
  },
  themeAttributes: {
    lang: "html",
    code: `<html lang="en" data-skin="studio" data-theme="dark" data-accent="teal">`,
  },
  themeScript: {
    lang: "html",
    code: `<script>
  try {
    const s = JSON.parse(localStorage.getItem("theme") ?? "{}");
    const r = document.documentElement;
    r.dataset.skin = s.skin ?? "studio";
    if (s.mode) r.dataset.theme = s.mode;
    if (s.accent) r.dataset.accent = s.accent;
  } catch {}
</script>`,
  },
  overrideTokens: {
    lang: "css",
    code: `:root[data-skin="studio"] {
  --radius: 1rem;
  --font-sans: "Figtree", system-ui, sans-serif;
}

:root[data-skin="studio"][data-theme="dark"] {
  --surface-base: oklch(18% 0.01 260);
}`,
  },
  layoutUtilities: {
    lang: "html",
    code: `<section class="stack" data-gap="4">
  <header class="row-between">
    <h2 class="truncate">Quarterly planning</h2>
    <button soneBtn variant="outline" size="sm" type="button">Share</button>
  </header>
  <div class="cluster">
    <span soneBadge>Product</span>
    <span soneBadge variant="secondary">Design</span>
  </div>
</section>`,
  },
  textUtilities: {
    lang: "html",
    code: `<p class="text-hint">Touch ID unlocks it for this session.</p>
<span class="text-caption">Edited 2 min ago</span>
<ul class="list-reset stack" data-gap="1">
  <li class="truncate">A long title that ends in an ellipsis…</li>
</ul>`,
  },
  fontFace: {
    lang: "css",
    code: `@font-face {
  font-family: "Figtree";
  font-weight: 300 900;
  font-display: swap;
  src: url("../fonts/figtree-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, /* … */ U+A720-A7FF;
}`,
  },
  extractI18n: {
    lang: "bash",
    code: `ng extract-i18n --format json --output-path src/locale`,
  },
  commit: {
    lang: "bash",
    code: `git switch -c feat/sone-calendar
git commit -m "feat(calendar): add the sone-calendar component"`,
  },
  mcpClaude: {
    lang: "bash",
    code: "claude mcp add surface-one-angular -- npx -y @surface-one/angular-mcp@latest",
  },
  mcpCodex: {
    lang: "bash",
    code: "codex mcp add surface-one-angular -- npx -y @surface-one/angular-mcp@latest",
  },
  mcpCodexToml: {
    lang: "toml",
    code: `[mcp_servers.surface-one-angular]
command = "npx"
args = ["-y", "@surface-one/angular-mcp@latest"]`,
  },
  mcpVsCode: {
    lang: "json",
    code: `{
  "servers": {
    "surface-one-angular": {
      "command": "npx",
      "args": ["-y", "@surface-one/angular-mcp@latest"]
    }
  }
}`,
  },
  mcpJson: {
    lang: "json",
    code: `{
  "mcpServers": {
    "surface-one-angular": {
      "command": "npx",
      "args": ["-y", "@surface-one/angular-mcp@latest"]
    }
  }
}`,
  },
  skillsAdd: {
    lang: "bash",
    code: `npx @surface-one/skills add                 # Claude, Codex and Copilot
npx @surface-one/skills add --agent claude   # only one assistant
npx @surface-one/skills add --global         # user-level folders`,
  },
};
