import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { interval, take } from "rxjs";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { type MarkdownSize, SoneMarkdownComponent } from "./markdown.component";

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAwCAIAAABVDSmEAAAAhElEQVR42u3QURGAIAAFMHKagAQkIIEJSEACE5iANhqB983tbglWrvZt1UAL9MAdGIEZeAJvYAWKaNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq06BOifz5OPbN3N7I0AAAAAElFTkSuQmCC";

export const KITCHEN_SINK = `# Weekly sync — decisions

The team agreed to **ship the redaction firewall** before the _sharing_ beta, and
to drop ~~the manual export step~~ in favour of the vault writer. Run \`npm run
ci\` before opening the PR, and see [the release checklist](https://example.com/release).

## Action items

- [x] Draft the threat matrix
- [ ] Review the OPAQUE login flow
  - [ ] Pair with the server team
- [ ] Record a demo for the landing page

### Owners

1. Lucas — firewall and egress ledger
2. Ana — onboarding copy
   - review the Polish strings
3. Kai — notarization

> Local-first is the promise. Anything that leaves the machine has to be loud,
> justified and on the ledger.

| Area        | Owner |  Due |
| :---------- | :---: | ---: |
| Redaction   | Lucas |  Fri |
| Onboarding  |  Ana  |  Mon |
| A very long cell that should wrap instead of widening the page | Kai | Next week |

\`\`\`ts
export function isCloud(provider: Provider): boolean {
  return provider.kind !== "on-device" && !provider.loopback;
}
\`\`\`

---

#### Level-four heading

A paragraph right after a rule, then an inline image:

![Accent stripes](${PIXEL})

and a remote one, which is never fetched: ![Tracking pixel](https://example.com/p.png)

Raw HTML is shown as text, not rendered: <b onclick="alert(1)">bold?</b>
`;

interface MarkdownArgs {
  source: string;
  size: MarkdownSize;
  breaks: boolean;
}

const meta: Meta<MarkdownArgs> = {
  title: "Components/Content/Markdown",
  excludeStories: /^[A-Z][A-Z0-9_]*$/,
  component: SoneMarkdownComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-markdown [source]>` — renders markdown as IndexOne prose (the counterpart of shadcn's " +
          "Markdown; spartan/ui has none). GFM: headings, emphasis, strikethrough, lists, task lists, " +
          "tables, quotes, fenced + inline code, links, rules, images. **Presentational** — no app " +
          "services, no wikilinks. **Safe** — raw HTML is escaped, only inline `data:` raster images " +
          "load, every block goes through DOMPurify and Angular's sanitiser. **Streaming** — append to " +
          "one string: the host is never re-created and only the last block's DOM is replaced. " +
          '`size="sm"` sets 14px for dense panes; `--prose-size` / `--prose-leading` retune the default.' +
          "\n\n**Reference**\n" +
          "- shadcn.io — [https://www.shadcn.io/ui/markdown](https://www.shadcn.io/ui/markdown)\n" +
          "- shadcn/ui typography — [https://ui.shadcn.com/docs/components/typography](https://ui.shadcn.com/docs/components/typography)\n" +
          "- no spartan/ui twin — own component in shadcn's language (angular-zoneless.md §6c, step 4)",
      },
    },
  },
  argTypes: {
    source: { control: "text" },
    size: { control: "inline-radio", options: ["default", "sm"] },
    breaks: { control: "boolean" },
  },
  args: { source: KITCHEN_SINK, size: "default", breaks: true },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 680px">
      <sone-markdown [source]="source" [size]="size" [breaks]="breaks" />
    </div>`,
  }),
};
export default meta;
type Story = StoryObj<MarkdownArgs>;

export const KitchenSink: Story = {};

export const Small: Story = { args: { size: "sm" } };

export const TaskList: Story = {
  args: {
    source:
      "- [x] Transcribe on-device\n- [x] Merge Me / Others\n- [ ] Summarise\n  - [ ] Redact names\n- [ ] Export to the vault",
  },
};

export const CodeAndTable: Story = {
  args: {
    source:
      "```rust\npub fn meeting_is_unlocked(state: &AppState, id: &str) -> Result<bool> {\n    // gate every read\n    Ok(state.unlocked_folders.lock()?.contains(id))\n}\n```\n\n" +
      "| Provider | Local | Needs consent |\n| --- | :---: | :---: |\n| on-device | yes | no |\n| ollama (loopback) | yes | no |\n| anthropic | no | yes |",
  },
};

export const Empty: Story = { args: { source: "" } };

export const SoftBreaks: Story = {
  args: {
    breaks: false,
    source:
      "These three lines\nare one paragraph\nwhen `breaks` is off.\n\nA blank line starts the next one.",
  },
};

export const Streaming: Story = {
  decorators: [moduleMetadata({ imports: [SoneButtonDirective] })],
  render: (args) => {
    const text = signal("");
    const start = (): void => {
      text.set("");
      const step = 6;
      interval(30)
        .pipe(take(Math.ceil(KITCHEN_SINK.length / step)))
        .subscribe((i) => text.set(KITCHEN_SINK.slice(0, (i + 1) * step)));
    };
    start();
    return {
      props: { ...args, text, start },
      template: `<div style="max-width: 680px; display: grid; gap: var(--space-3)">
        <div><button soneBtn type="button" variant="outline" size="sm" (click)="start()">Replay</button></div>
        <sone-markdown [source]="text()" [size]="size" />
      </div>`,
    };
  },
};
