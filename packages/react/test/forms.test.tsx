import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneChoiceCard,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
} from "../src/components/choice-card";
import { SoneCopyButton } from "../src/components/copy-button";
import { SoneFilterChips } from "../src/components/filter-chips";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneFieldLabelOptional,
  SoneFieldLegend,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneInputGroupText,
  SoneInputGroupTextarea,
} from "../src/components/input";
import { SoneInputNumber } from "../src/components/input-number";
import { SoneInputOtp } from "../src/components/input-otp";
import { SonePasswordInput } from "../src/components/password-input";
import { SoneRating } from "../src/components/rating";
import {
  SoneSearchField,
  type SoneSearchFieldHandle,
} from "../src/components/search-field";
import { SoneSegmented } from "../src/components/segmented";
import { SoneSelect } from "../src/components/select";
import { SoneSlider } from "../src/components/slider";
import { SoneSwitch } from "../src/components/switch";
import {
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggle,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "../src/components/toggle-group";
import { SoneMessagesProvider } from "../src/context/messages";

afterEach(() => {
  vi.restoreAllMocks();
});

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};
const ssr = (node: ReactNode): HTMLElement => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el;
};

/** Server-renders, then hydrates in the browser; fails on a hydration mismatch. */
async function hydrate(node: ReactNode): Promise<HTMLElement> {
  renderToString(node); // another request rendered first, as on a long-running server
  const el = document.createElement("div");
  document.body.appendChild(el);
  el.innerHTML = renderToString(node);
  const errors: unknown[] = [];
  const error = vi
    .spyOn(console, "error")
    .mockImplementation((...a) => errors.push(...a));
  await act(async () => {
    hydrateRoot(el, node, { onRecoverableError: (e) => errors.push(e) });
  });
  error.mockRestore();
  expect(errors.map(String).join(" ")).not.toMatch(
    /hydrat|mismatch|did not match/i,
  );
  return el;
}

describe("SoneField", () => {
  it("describes the control by its description and error and marks it invalid", () => {
    function Demo({ invalid }: { invalid: boolean }) {
      return (
        <SoneField invalid={invalid}>
          <input aria-describedby="own" />
          <SoneFieldDescription id="desc">Help</SoneFieldDescription>
          {invalid ? <SoneFieldError id="err">Wrong</SoneFieldError> : null}
        </SoneField>
      );
    }
    const { container, rerender } = render(<Demo invalid={false} />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-describedby")).toBe("own desc");
    rerender(<Demo invalid />);
    expect(input.getAttribute("aria-describedby")).toBe("own desc err");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Wrong");
    rerender(<Demo invalid={false} />);
    expect(input.getAttribute("aria-describedby")).toBe("own desc");
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("links a generated description id to a control inside an input group and to its label", () => {
    const { container } = render(
      <SoneField>
        <SoneFieldLabel htmlFor="site">Website</SoneFieldLabel>
        <SoneInputGroup>
          <SoneInputGroupAddon as="span">
            <SoneInputGroupText>https://</SoneInputGroupText>
          </SoneInputGroupAddon>
          <SoneInputGroupInput id="site" />
        </SoneInputGroup>
        <SoneFieldDescription>Host name</SoneFieldDescription>
      </SoneField>,
    );
    const desc = container.querySelector("[data-slot=field-description]")!;
    expect(desc.id).toMatch(/^sone-field-description-/);
    const input = screen.getByLabelText("Website");
    expect(input.getAttribute("aria-describedby")).toBe(desc.id);
    expect(screen.getByRole("textbox", { description: "Host name" })).toBe(
      input,
    );
  });

  it("server-renders the field parts", () => {
    const out = html(
      <SoneFieldGroup variant="choices">
        <SoneField orientation="horizontal" invalid disabled>
          <SoneFieldLabel>
            Guidance <SoneFieldLabelOptional>Optional</SoneFieldLabelOptional>
          </SoneFieldLabel>
          <SoneFieldLegend variant="label">L</SoneFieldLegend>
        </SoneField>
      </SoneFieldGroup>,
    );
    expect(out).toContain('data-slot="field-group" data-variant="choices"');
    expect(out).toContain(
      'role="group" data-slot="field" data-orientation="horizontal" data-invalid="true" data-disabled="true"',
    );
    expect(out).toContain(
      '<span data-slot="field-label-optional">Optional</span>',
    );
    expect(out).toContain(
      '<legend data-slot="field-legend" data-variant="label">',
    );
  });
});

describe("SoneInputGroup", () => {
  it("fill, invalid and a <form> keeping its own role", () => {
    const el = ssr(
      <>
        <SoneInputGroup fill invalid />
        <SoneInputGroup as="form" />
      </>,
    );
    const [a, b] = Array.from(
      el.querySelectorAll<HTMLElement>("[data-slot=input-group]"),
    );
    expect(a!.getAttribute("data-fill")).toBe("");
    expect(a!.getAttribute("data-invalid")).toBe("true");
    expect(a!.getAttribute("role")).toBe("group");
    expect(b!.tagName).toBe("FORM");
    expect(b!.hasAttribute("role")).toBe(false);
  });

  it("a click on an addon's empty area focuses the control; the control reports its value", () => {
    const changes: string[] = [];
    const { container } = render(
      <SoneInputGroup>
        <SoneInputGroupAddon>
          <span>@</span>
        </SoneInputGroupAddon>
        <SoneInputGroupInput
          defaultValue=""
          onValueChange={(v) => changes.push(v)}
        />
      </SoneInputGroup>,
      { container: document.body.appendChild(document.createElement("div")) },
    );
    const input = container.querySelector("input")!;
    expect(input.getAttribute("data-slot")).toBe("input-group-control");
    fireEvent.click(container.querySelector("span")!);
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: "me" } });
    expect(changes).toEqual(["me"]);
  });

  it("a controlled textarea follows its value; null shows empty", () => {
    function Demo() {
      const [v, setV] = useState<string | null>(null);
      return <SoneInputGroupTextarea value={v} onValueChange={setV} />;
    }
    const { container } = render(<Demo />);
    const area = container.querySelector("textarea")!;
    expect(area.value).toBe("");
    fireEvent.change(area, { target: { value: "hi" } });
    expect(area.value).toBe("hi");
  });
});

describe("SoneSwitch", () => {
  it("controlled: reports and follows checked", () => {
    function Demo() {
      const [on, setOn] = useState(false);
      return (
        <>
          <SoneSwitch
            checked={on}
            onCheckedChange={setOn}
            inputId="s"
            className="host"
          />
          <output>{String(on)}</output>
        </>
      );
    }
    const { container } = render(<Demo />);
    const input = container.querySelector("input")!;
    expect(container.querySelector("sone-switch")!.getAttribute("class")).toBe(
      "host",
    );
    expect(input.id).toBe("s");
    expect(input.className).toBe("switch");
    fireEvent.click(input);
    expect(screen.getByText("true")).toBeTruthy();
    expect(input.getAttribute("data-state")).toBe("checked");
  });

  it("uncontrolled with defaultChecked; a fixed controlled value does not move", () => {
    const changes: boolean[] = [];
    const { container } = render(
      <>
        <SoneSwitch
          defaultChecked
          onCheckedChange={(v) => changes.push(v)}
          aria-label="A"
        />
        <SoneSwitch
          checked={false}
          onCheckedChange={(v) => changes.push(v)}
          ariaLabel="B"
        />
      </>,
    );
    const [a, b] = Array.from(container.querySelectorAll("input"));
    expect(a!.checked).toBe(true);
    fireEvent.click(a!);
    expect(a!.checked).toBe(false);
    expect(a!.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(b!);
    expect(b!.checked).toBe(false);
    expect(b!.getAttribute("aria-label")).toBe("B");
    expect(changes).toEqual([false, true]);
  });

  it("server-renders the host and the checkbox", () => {
    const out = html(<SoneSwitch defaultChecked size="sm" invalid />);
    expect(out).toMatch(/^<sone-switch><input/);
    expect(out).toContain('data-slot="switch"');
    expect(out).toContain('data-size="sm"');
    expect(out).toContain('data-state="checked"');
    expect(out).toContain('aria-invalid="true"');
  });
});

describe("SoneSelect", () => {
  const options = (
    <>
      <option value="a">A</option>
      <option value="b">B</option>
    </>
  );

  it("calls onSelectionChange only for a user pick, not when the owner sets the value", () => {
    const changes: string[] = [];
    const picks: string[] = [];
    const props = {
      ariaDescribedby: "hint",
      onValueChange: (v: string) => changes.push(v),
      onSelectionChange: (v: string) => picks.push(v),
    };
    const { container, rerender } = render(
      <SoneSelect value="a" {...props}>
        {options}
      </SoneSelect>,
    );
    const select = container.querySelector("select")!;
    expect(select.getAttribute("aria-describedby")).toBe("hint");
    rerender(
      <SoneSelect value="b" {...props}>
        {options}
      </SoneSelect>,
    );
    expect(select.value).toBe("b");
    expect(picks).toEqual([]);
    expect(changes).toEqual([]);
    fireEvent.change(select, { target: { value: "a" } });
    expect(picks).toEqual(["a"]);
    expect(changes).toEqual(["a"]);
  });

  it("uncontrolled with defaultValue; server-renders the wrapper", () => {
    const { container } = render(
      <SoneSelect
        defaultValue="b"
        selectId="lang"
        size="sm"
        disabled
        className="w"
      >
        {options}
      </SoneSelect>,
    );
    const select = container.querySelector("select")!;
    expect(select.value).toBe("b");
    expect(select.id).toBe("lang");
    const host = container.querySelector("sone-select")!;
    expect(host.getAttribute("class")).toBe("w");
    expect(host.getAttribute("data-slot")).toBe("native-select-wrapper");
    expect(host.getAttribute("data-disabled")).toBe("true");
    const out = html(<SoneSelect defaultValue="b">{options}</SoneSelect>);
    expect(out).toContain(
      '<sone-select data-slot="native-select-wrapper" data-size="default">',
    );
    expect(out).toContain('data-slot="native-select"');
  });
});

describe("SoneSlider", () => {
  it("reports a number and fills the track", () => {
    const changes: number[] = [];
    const { container } = render(
      <SoneSlider
        defaultValue={25}
        min={0}
        max={50}
        ariaLabel="Volume"
        onValueChange={(v) => changes.push(v)}
      />,
    );
    const input = container.querySelector("input")!;
    expect(input.style.getPropertyValue("--sone-range-fill")).toBe("50%");
    expect(input.getAttribute("aria-label")).toBe("Volume");
    fireEvent.change(input, { target: { value: "10" } });
    expect(changes).toEqual([10]);
    expect(input.style.getPropertyValue("--sone-range-fill")).toBe("20%");
  });

  it("server-renders the host", () => {
    const out = html(<SoneSlider value={60} disabled />);
    expect(out).toContain(
      '<sone-slider data-slot="slider" data-orientation="horizontal" data-disabled="">',
    );
    expect(out).toContain('class="sone-range"');
    expect(out).toContain('data-slot="slider-thumb"');
  });
});

describe("SoneToggleGroup", () => {
  it("moves focus with the arrow keys, skipping a disabled item", () => {
    render(
      <SoneToggleGroup>
        <SoneToggleGroupItem>1</SoneToggleGroupItem>
        <SoneToggleGroupItem disabled>2</SoneToggleGroupItem>
        <SoneToggleGroupItem>3</SoneToggleGroupItem>
      </SoneToggleGroup>,
      { container: document.body.appendChild(document.createElement("div")) },
    );
    const [first, , third] = screen.getAllByRole("button");
    first!.focus();
    fireEvent.keyDown(first!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(third);
    fireEvent.keyDown(third!, { key: "Home" });
    expect(document.activeElement).toBe(first);
  });

  it("dashed reaches the items; stretch and spacing", () => {
    const el = ssr(
      <SoneToggleGroup variant="dashed" stretch spacing={2}>
        <SoneToggleGroupItem pressed>New folder</SoneToggleGroupItem>
      </SoneToggleGroup>,
    );
    const group = el.querySelector<HTMLElement>("[data-slot=toggle-group]")!;
    expect(group.className).toBe("toggle-group");
    expect(group.getAttribute("data-stretch")).toBe("");
    expect(group.getAttribute("style")).toBe("--toggle-group-spacing:2");
    const item = el.querySelector("[data-slot=toggle-group-item]")!;
    expect(item.getAttribute("data-variant")).toBe("dashed");
    expect(item.getAttribute("aria-pressed")).toBe("true");
    expect(item.getAttribute("data-state")).toBe("on");
    expect(item.className).toBe("toggle");
    expect(ssr(<SoneToggleGroup />).querySelector("[data-stretch]")).toBeNull();
  });

  it("type=single presses by value, reports it and is one Tab stop", () => {
    const changes: unknown[] = [];
    function Demo() {
      const [view, setView] = useState<string | readonly string[] | null>("b");
      return (
        <SoneToggleGroup
          type="single"
          aria-label="View"
          value={view}
          onValueChange={(v) => {
            changes.push(v);
            setView(v);
          }}
        >
          {["a", "b", "c"].map((v) => (
            <SoneToggleGroupItem key={v} value={v}>
              {v}
            </SoneToggleGroupItem>
          ))}
        </SoneToggleGroup>
      );
    }
    render(<Demo />);
    expect(screen.getByRole("group").getAttribute("aria-label")).toBe("View");
    const items = () => screen.getAllByRole("button");
    expect(items().map((b) => b.getAttribute("aria-pressed"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    expect(items().map((b) => b.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
    fireEvent.click(items()[2]!);
    expect(items()[2]!.getAttribute("data-state")).toBe("on");
    fireEvent.click(items()[2]!);
    expect(changes).toEqual(["c", null]);
    fireEvent.focus(items()[0]!);
    expect(items().map((b) => b.getAttribute("tabindex"))).toEqual([
      "0",
      "-1",
      "-1",
    ]);
  });

  it("type=multiple is uncontrolled with defaultValue; disabled stops every item", () => {
    const changes: unknown[] = [];
    const { rerender } = render(
      <SoneToggleGroup
        type="multiple"
        defaultValue={["a"]}
        onValueChange={(v) => changes.push(v)}
      >
        <SoneToggleGroupItem value="a">a</SoneToggleGroupItem>
        <SoneToggleGroupItem value="b">b</SoneToggleGroupItem>
      </SoneToggleGroup>,
    );
    fireEvent.click(screen.getByText("b"));
    fireEvent.click(screen.getByText("a"));
    expect(changes).toEqual([["a", "b"], ["b"]]);
    rerender(
      <SoneToggleGroup type="multiple" disabled>
        <SoneToggleGroupItem value="a">a</SoneToggleGroupItem>
      </SoneToggleGroup>,
    );
    expect(screen.getByText("a").hasAttribute("disabled")).toBe(true);
  });

  it("without type, items keep their own pressed and no tabindex", () => {
    const el = ssr(
      <SoneToggleGroup>
        <SoneToggleGroupItem value="a" pressed>
          a
        </SoneToggleGroupItem>
      </SoneToggleGroup>,
    );
    const item = el.querySelector("[data-slot=toggle-group-item]")!;
    expect(item.getAttribute("aria-pressed")).toBe("true");
    expect(item.hasAttribute("tabindex")).toBe(false);
    expect(el.querySelector("[role=group]")).toBeNull();
  });

  it("SoneToggle and SoneTabsList / SoneTabsTrigger", () => {
    const el = ssr(
      <>
        <SoneToggle pressed variant="outline">
          T
        </SoneToggle>
        <SoneTabsList stretch role="tablist" orientation="vertical">
          <SoneTabsTrigger role="tab" active>
            A
          </SoneTabsTrigger>
          <SoneTabsTrigger role="tab">B</SoneTabsTrigger>
        </SoneTabsList>
        <SoneTabsList>
          <SoneTabsTrigger active icon>
            C
          </SoneTabsTrigger>
        </SoneTabsList>
      </>,
    );
    const toggle = el.querySelector("[data-slot=toggle]")!;
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.getAttribute("data-variant")).toBe("outline");
    const [list, plain] = Array.from(
      el.querySelectorAll("[data-slot=tabs-list]"),
    );
    expect(list!.getAttribute("data-stretch")).toBe("");
    expect(list!.getAttribute("aria-orientation")).toBe("vertical");
    const [a, b, c] = Array.from(
      el.querySelectorAll("[data-slot=tabs-trigger]"),
    );
    expect(a!.getAttribute("aria-selected")).toBe("true");
    expect(a!.getAttribute("tabindex")).toBe("0");
    expect(b!.getAttribute("tabindex")).toBe("-1");
    expect(a!.hasAttribute("aria-pressed")).toBe(false);
    expect(plain!.hasAttribute("aria-orientation")).toBe(false);
    expect(c!.getAttribute("aria-pressed")).toBe("true");
    expect(c!.hasAttribute("aria-selected")).toBe(false);
    expect(c!.getAttribute("data-icon")).toBe("");
  });
});

describe("SoneSegmented", () => {
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B", icon: "star" as const, iconOnly: true },
  ];

  it("presses the selected option and reports the clicked one", () => {
    const changes: string[] = [];
    const { container } = render(
      <SoneSegmented
        value="a"
        options={options}
        ariaLabel="Pick"
        onValueChange={(v) => changes.push(v)}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual([
      "true",
      "false",
    ]);
    expect(buttons[1]!.getAttribute("aria-label")).toBe("B");
    expect(screen.getByRole("group").getAttribute("aria-label")).toBe("Pick");
    fireEvent.click(buttons[1]!);
    expect(changes).toEqual(["b"]);
    // Controlled at "a": still pressed.
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
    expect(
      container.querySelector("sone-segmented")!.getAttribute("data-slot"),
    ).toBe("segmented");
  });

  it("uncontrolled moves the pressed state; server-renders", () => {
    render(<SoneSegmented defaultValue="a" options={options} />);
    fireEvent.click(screen.getAllByRole("button")[1]!);
    expect(
      screen.getAllByRole("button").map((b) => b.getAttribute("aria-pressed")),
    ).toEqual(["false", "true"]);
    const out = html(<SoneSegmented defaultValue="a" options={options} />);
    expect(out).toMatch(
      /^<sone-segmented data-slot="segmented"><div data-slot="toggle-group"[^>]* role="group"/,
    );
    expect(out).toContain('data-variant="outline"');
  });
});

describe("SoneChoiceGroup", () => {
  function Plans({ initial = "a" }: { initial?: string }) {
    const [plan, setPlan] = useState(initial);
    return (
      <SoneChoiceGroup aria-label="Plan">
        {["a", "b", "c"].map((p) => (
          <SoneChoiceCard
            key={p}
            type="button"
            selected={plan === p}
            onClick={() => setPlan(p)}
          >
            <SoneChoiceCardTitle>{p}</SoneChoiceCardTitle>
            <SoneChoiceCardIndicator />
          </SoneChoiceCard>
        ))}
      </SoneChoiceGroup>
    );
  }

  it("is one Tab stop and arrows select the next card", () => {
    render(<Plans />, {
      container: document.body.appendChild(document.createElement("div")),
    });
    const cards = () => screen.getAllByRole("radio");
    expect(cards().map((c) => c.getAttribute("tabindex"))).toEqual([
      "0",
      "-1",
      "-1",
    ]);
    expect(cards().map((c) => c.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    fireEvent.keyDown(cards()[0]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(cards()[1]);
    expect(cards().map((c) => c.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    expect(cards().map((c) => c.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
    fireEvent.keyDown(cards()[1]!, { key: "End" });
    expect(cards()[2]!.getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(cards()[2]!, { key: "ArrowRight" });
    expect(cards()[0]!.getAttribute("aria-checked")).toBe("true");
  });

  it("server-renders the checked card as the tab stop, else the first enabled one", () => {
    const el = ssr(<Plans initial="c" />);
    expect(
      Array.from(el.querySelectorAll("[role=radio]")).map((c) =>
        c.getAttribute("tabindex"),
      ),
    ).toEqual(["-1", "-1", "0"]);
    const card = el.querySelector("[data-slot=choice-card]")!;
    expect(card.className).toBe("choice-card");
    expect(card.getAttribute("data-with-indicator")).toBe("");
    expect(
      el.querySelector("[data-slot=choice-group]")!.getAttribute("role"),
    ).toBe("radiogroup");
    const none = ssr(
      <SoneChoiceGroup>
        <SoneChoiceCard disabled>x</SoneChoiceCard>
        <SoneChoiceCard>y</SoneChoiceCard>
      </SoneChoiceGroup>,
    );
    expect(
      Array.from(none.querySelectorAll("[role=radio]")).map((c) =>
        c.getAttribute("tabindex"),
      ),
    ).toEqual(["-1", "0"]);
  });

  it("hydrates without a mismatch", async () => {
    const el = await hydrate(<Plans initial="b" />);
    expect(
      Array.from(el.querySelectorAll("[role=radio]")).map((c) =>
        c.getAttribute("tabindex"),
      ),
    ).toEqual(["-1", "0", "-1"]);
  });

  it("a standalone card is a pressed toggle with no tab index", () => {
    render(
      <SoneChoiceCard selected orientation="horizontal">
        Solo
      </SoneChoiceCard>,
    );
    const card = screen.getByRole("button");
    expect(card.getAttribute("aria-pressed")).toBe("true");
    expect(card.hasAttribute("aria-checked")).toBe(false);
    expect(card.hasAttribute("tabindex")).toBe(false);
    expect(card.hasAttribute("data-with-indicator")).toBe(false);
    expect(card.getAttribute("data-orientation")).toBe("horizontal");
  });
});

describe("SoneInputNumber", () => {
  it("steps with the buttons and keys, clamps and parses a draft", () => {
    const changes: (number | null)[] = [];
    render(
      <SoneInputNumber
        defaultValue={2}
        min={1}
        max={10}
        inputId="q"
        ariaLabel="Qty"
        onValueChange={(v) => changes.push(v)}
      />,
    );
    const field = screen.getByRole("spinbutton");
    expect(field.getAttribute("aria-valuenow")).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect((field as HTMLInputElement).value).toBe("3");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    fireEvent.keyDown(field, { key: "PageUp" });
    expect(changes).toEqual([3, 2, 10]);
    expect(
      screen.getByRole("button", { name: "Increase" }).hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.keyDown(field, { key: "Home" });
    expect(field.getAttribute("aria-valuenow")).toBe("1");
    fireEvent.change(field, { target: { value: "4,0" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(field.getAttribute("aria-valuenow")).toBe("4");
    fireEvent.change(field, { target: { value: "99" } });
    fireEvent.blur(field);
    expect((field as HTMLInputElement).value).toBe("10");
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.blur(field);
    expect(changes.at(-1)).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Decrease" })
        .getAttribute("aria-controls"),
    ).toBe("q");
  });

  it("controlled: a fixed value snaps back; translated labels; server markup", () => {
    render(
      <SoneMessagesProvider
        messages={{ increase: "Więcej", decrease: "Mniej" }}
      >
        <SoneInputNumber value={5} step={0.5} />
      </SoneMessagesProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Więcej" }));
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
      "5",
    );
    const out = html(<SoneInputNumber value={1} size="sm" invalid />);
    expect(out).toMatch(
      /^<sone-input-number data-slot="input-number" data-size="sm" data-invalid="true">/,
    );
    expect(out).toContain('class="btn input-number-step"');
    expect(out).toContain('data-slot="input-number-decrement"');
    expect(out).toContain('data-size="icon-xs"');
  });
});

describe("SoneInputOtp", () => {
  it("keeps only allowed characters, draws them in slots and completes", () => {
    const completed: string[] = [];
    function Demo() {
      const [code, setCode] = useState("");
      return (
        <SoneInputOtp
          value={code}
          onValueChange={setCode}
          groups={[3, 3]}
          ariaLabel="Code"
          ariaDescribedby="otp-hint"
          onComplete={(c) => completed.push(c)}
        />
      );
    }
    const { container } = render(<Demo />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("autocomplete")).toBe("one-time-code");
    expect(input.getAttribute("inputmode")).toBe("numeric");
    expect(input.getAttribute("aria-describedby")).toBe("otp-hint");
    fireEvent.change(input, { target: { value: "12-a3" } });
    expect(input.value).toBe("123");
    expect(
      Array.from(container.querySelectorAll(".otp-slot")).map(
        (s) => s.textContent,
      ),
    ).toEqual(["1", "2", "3", "", "", ""]);
    expect(container.querySelectorAll(".otp-separator")).toHaveLength(1);
    fireEvent.change(input, { target: { value: "1234567" } });
    expect(input.value).toBe("123456");
    expect(completed).toEqual(["123456"]);
  });

  it("marks the active slot while focused; alphanumeric; ref reaches the input", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <SoneInputOtp
        ref={ref}
        length={4}
        pattern="^[a-zA-Z0-9]+$"
        defaultValue="ab"
        className="otp"
      />,
    );
    expect(ref.current?.tagName).toBe("INPUT");
    expect(ref.current!.getAttribute("inputmode")).toBe("text");
    expect(
      container.querySelector("sone-input-otp")!.getAttribute("class"),
    ).toBe("otp");
    fireEvent.focus(ref.current!);
    const slots = container.querySelectorAll(".otp-slot");
    expect(slots[2]!.hasAttribute("data-active")).toBe(true);
    expect(slots[2]!.querySelector(".otp-caret")).not.toBeNull();
    fireEvent.blur(ref.current!);
    expect(container.querySelector("[data-active]")).toBeNull();
  });

  it("server-renders the host and the slots", () => {
    const out = html(<SoneInputOtp disabled invalid />);
    expect(out).toContain(
      '<sone-input-otp data-slot="input-otp" data-disabled="" data-invalid="">',
    );
    expect(out).toContain('maxLength="6"'.toLowerCase());
    expect(
      ssr(<SoneInputOtp />).querySelectorAll("[data-slot=input-otp-slot]"),
    ).toHaveLength(6);
  });
});

describe("SonePasswordInput", () => {
  it("reports the value and toggles visibility with aria-pressed", () => {
    function Demo() {
      const [pw, setPw] = useState("");
      return (
        <>
          <SonePasswordInput
            value={pw}
            onValueChange={setPw}
            autoComplete="new-password"
            ariaLabel="Password"
          />
          <output>{pw}</output>
        </>
      );
    }
    const { container } = render(<Demo />);
    const input = container.querySelector("input")!;
    expect(input.type).toBe("password");
    expect(input.getAttribute("autocomplete")).toBe("new-password");
    fireEvent.change(input, { target: { value: "hunter22" } });
    expect(container.querySelector("output")!.textContent).toBe("hunter22");
    const toggle = screen.getByRole("button");
    expect(toggle.getAttribute("aria-label")).toBe("Show password");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(
      container
        .querySelector("sone-password-input")!
        .getAttribute("data-visible"),
    ).toBe("");
  });

  it("controlled visibility reports the toggle; server markup", () => {
    const seen: boolean[] = [];
    const { container } = render(
      <SonePasswordInput visible onVisibleChange={(v) => seen.push(v)} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(seen).toEqual([false]);
    expect(container.querySelector("input")!.type).toBe("text");
    const out = html(<SonePasswordInput invalid disabled />);
    expect(out).toContain(
      '<sone-password-input data-slot="password-input"><div role="group" data-slot="input-group" data-invalid="true" data-disabled="true">',
    );
    expect(out).toContain('data-slot="password-input-toggle"');
  });
});

describe("SoneRating", () => {
  it("a native radio group: picks, previews on hover and clears", () => {
    const changes: number[] = [];
    const { container } = render(
      <SoneRating
        defaultValue={2}
        clearable
        ariaLabel="Yours"
        onValueChange={(v) => changes.push(v)}
      />,
    );
    expect(screen.getByRole("radiogroup").getAttribute("aria-label")).toBe(
      "Yours",
    );
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios).toHaveLength(5);
    expect(radios[1]!.checked).toBe(true);
    expect(screen.getByLabelText("3 stars")).toBe(radios[2]);
    fireEvent.mouseEnter(radios[3]!.closest("label")!);
    const fills = () =>
      Array.from(container.querySelectorAll<HTMLElement>(".rating-glyph")).map(
        (g) => g.style.getPropertyValue("--rating-fill"),
      );
    expect(fills()).toEqual(["1", "1", "1", "1", "0"]);
    fireEvent.mouseLeave(screen.getByRole("radiogroup"));
    expect(fills()).toEqual(["1", "1", "0", "0", "0"]);
    fireEvent.click(radios[3]!);
    expect(changes).toEqual([4]);
    fireEvent.click(radios[3]!);
    expect(changes).toEqual([4, 0]);
    expect(radios.some((r) => r.checked)).toBe(false);
  });

  it("readonly: one image named by its score", () => {
    render(<SoneRating value={4.46} readonly ariaLabel="Average" size="sm" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "Average: 4.5 out of 5",
    );
    const out = html(<SoneRating value={3} readonly />);
    expect(out).toContain(
      '<sone-rating data-slot="rating" data-size="default" data-readonly="">',
    );
  });

  it("the radio group name survives hydration and differs per rating", async () => {
    const el = await hydrate(
      <>
        <SoneRating defaultValue={2} ariaLabel="First" />
        <SoneRating defaultValue={3} ariaLabel="Second" />
      </>,
    );
    const names = Array.from(el.querySelectorAll("input")).map((i) => i.name);
    expect(new Set(names).size).toBe(2);
  });
});

describe("SoneSearchField", () => {
  it("renders a searchbox in an input group; value, clear button and Enter", () => {
    const submitted: string[] = [];
    function Demo() {
      const [q, setQ] = useState("");
      return (
        <SoneSearchField
          value={q}
          onValueChange={setQ}
          onSubmit={(v) => submitted.push(v)}
          clearable
          ariaLabel="Search notes"
          className="wide"
        />
      );
    }
    const { container } = render(<Demo />, {
      container: document.body.appendChild(document.createElement("div")),
    });
    expect(
      container.querySelector("sone-search-field")!.getAttribute("class"),
    ).toBe("wide");
    const input = container.querySelector("input")!;
    expect(input.getAttribute("role")).toBe("searchbox");
    expect(input.getAttribute("aria-label")).toBe("Search notes");
    expect(input.getAttribute("placeholder")).toBe("Search");
    expect(container.querySelector(".search-field-clear")).toBeNull();
    fireEvent.change(input, { target: { value: "budget" } });
    const clear = container.querySelector(".search-field-clear")!;
    expect(clear.getAttribute("aria-label")).toBe("Clear search");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(submitted).toEqual(["budget"]);
    fireEvent.click(clear);
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
  });

  it("Escape clears first, then calls onEscape", () => {
    const escapes: number[] = [];
    const outer: number[] = [];
    const { container } = render(
      <div onKeyDown={() => outer.push(1)}>
        <SoneSearchField
          defaultValue="x"
          clearable
          onEscape={() => escapes.push(1)}
        />
      </div>,
    );
    const input = container.querySelector("input")!;
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
    expect(escapes).toEqual([]);
    expect(outer).toEqual([]);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(escapes).toEqual([1]);
  });

  it("handleRef.clear() empties the field and reports it", () => {
    const handle = createRef<SoneSearchFieldHandle>();
    const changes: string[] = [];
    const { container } = render(
      <SoneSearchField
        handleRef={handle}
        defaultValue="pricing"
        clearable
        onValueChange={(v) => changes.push(v)}
      />,
    );
    act(() => handle.current!.clear());
    expect(container.querySelector("input")!.value).toBe("");
    expect(changes).toEqual([""]);
    expect(container.querySelector(".search-field-clear")).toBeNull();
  });

  it("disabled and size", () => {
    const out = ssr(<SoneSearchField value="x" clearable disabled size="sm" />);
    expect(
      out.querySelector("sone-search-field")!.getAttribute("data-size"),
    ).toBe("sm");
    expect(out.querySelector("input")!.hasAttribute("disabled")).toBe(true);
    expect(out.querySelector(".search-field-clear")).toBeNull();
    expect(
      out
        .querySelector("[data-slot=input-group]")!
        .getAttribute("data-disabled"),
    ).toBe("true");
  });
});

describe("SoneFilterChips", () => {
  const OPTIONS = [
    { value: "all", label: "All", count: 128 },
    { value: "error", label: "Errors", count: 3, tone: "danger" as const },
    { value: "warn", label: "Warnings", disabled: true },
    { value: "info", label: "Info" },
  ];

  it("toggle chips: a labelled group of aria-pressed buttons with tinted counts", () => {
    function Demo() {
      const [v, setV] = useState("all");
      return (
        <SoneFilterChips
          options={OPTIONS}
          value={v}
          onValueChange={setV}
          ariaLabel="Filter by level"
        />
      );
    }
    render(<Demo />, {
      container: document.body.appendChild(document.createElement("div")),
    });
    const group = screen.getByRole("group");
    expect(group.getAttribute("aria-label")).toBe("Filter by level");
    expect(group.getAttribute("data-variant")).toBe("outline");
    expect(group.className).toBe("toggle-group list");
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual([
      "true",
      "false",
      "false",
      "false",
    ]);
    expect(
      buttons[1]!.querySelector(".count")!.getAttribute("data-variant"),
    ).toBe("destructive");
    expect(buttons[2]!.hasAttribute("disabled")).toBe(true);
    fireEvent.click(buttons[1]!);
    expect(buttons[1]!.getAttribute("aria-pressed")).toBe("true");

    // Arrows skip the disabled chip; Home / End jump to the ends.
    buttons[1]!.focus();
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[3]);
    fireEvent.keyDown(group, { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(group, { key: "End" });
    expect(document.activeElement).toBe(buttons[3]);
  });

  it("tabs: a group of pressed buttons, not a tablist", () => {
    const el = ssr(
      <SoneFilterChips options={OPTIONS} value="info" variant="tabs" />,
    );
    expect(
      el.querySelector("sone-filter-chips")!.getAttribute("data-variant"),
    ).toBe("tabs");
    const list = el.querySelector("[data-slot=tabs-list]")!;
    expect(list.getAttribute("role")).toBe("group");
    const buttons = Array.from(el.querySelectorAll("button"));
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual([
      "false",
      "false",
      "false",
      "true",
    ]);
    expect(buttons[0]!.hasAttribute("aria-selected")).toBe(false);
  });
});

describe("SoneCopyButton", () => {
  it("writes the value, shows and announces Copied, then resets", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    try {
      const copied: string[] = [];
      const { container } = render(
        <SoneCopyButton value="abc" onCopied={(v) => copied.push(v)} />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button"));
      });
      expect(copied).toEqual(["abc"]);
      expect(writeText).toHaveBeenCalledWith("abc");
      expect(screen.getByRole("button").textContent?.trim()).toBe("Copied");
      expect(container.querySelector('[aria-live="polite"]')!.textContent).toBe(
        "Copied",
      );
      expect(
        container.querySelector("sone-copy-button")!.getAttribute("data-state"),
      ).toBe("copied");
      act(() => vi.advanceTimersByTime(1500));
      expect(screen.getByRole("button").textContent?.trim()).toBe("Copy");
      expect(container.querySelector('[aria-live="polite"]')!.textContent).toBe(
        "",
      );
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("calls onCopyError when the clipboard refuses", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    try {
      const errors: unknown[] = [];
      const copied: string[] = [];
      render(
        <SoneCopyButton
          value="abc"
          iconOnly
          onCopyError={(e) => errors.push(e)}
          onCopied={(v) => copied.push(v)}
        />,
      );
      expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
        "Copy",
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button"));
      });
      expect(errors).toHaveLength(1);
      expect(copied).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("server-renders the host and the live region", () => {
    const out = html(<SoneCopyButton value="x" />);
    expect(out).toMatch(
      /^<sone-copy-button data-slot="copy-button" data-state="idle"><button/,
    );
    expect(out).toContain('data-size="sm"');
    expect(out).toContain('data-slot="copy-button-status"');
  });
});
