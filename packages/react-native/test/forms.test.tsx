import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneInput,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneInputGroupText,
  SoneTextarea,
} from "../src/components/input";
import { SoneInputNumber } from "../src/components/input-number";
import { SoneInputOtp } from "../src/components/input-otp";
import { SonePasswordInput } from "../src/components/password-input";
import { SoneSearchField } from "../src/components/search-field";
import { SoneSwitch } from "../src/components/switch";

const type = (el: HTMLElement, value: string) =>
  fireEvent.change(el, { target: { value } });

describe("SoneInput / SoneTextarea", () => {
  it("is uncontrolled and reports edits", () => {
    const onValueChange = vi.fn();
    render(
      <SoneInput
        aria-label="Name"
        defaultValue="A"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("textbox", {
      name: "Name",
    }) as HTMLInputElement;
    expect(input.value).toBe("A");
    type(input, "Ada");
    expect(onValueChange).toHaveBeenCalledWith("Ada");
    expect(input.value).toBe("Ada");
  });

  it("stays on a controlled value", () => {
    render(<SoneInput aria-label="Name" value="fixed" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    type(input, "other");
    expect(input.value).toBe("fixed");
  });

  it("is read-only while disabled", () => {
    render(<SoneInput aria-label="Name" disabled />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(input.hasAttribute("readonly")).toBe(true);
  });

  it("draws the textarea multi-line", () => {
    render(<SoneTextarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" }).tagName).toBe(
      "TEXTAREA",
    );
  });
});

describe("SoneField", () => {
  it("names its control by the label and passes invalid / disabled down", () => {
    render(
      <SoneField invalid disabled>
        <SoneFieldLabel>Email</SoneFieldLabel>
        <SoneInput testID="email" />
        <SoneFieldDescription>Work address</SoneFieldDescription>
        <SoneFieldError>Required</SoneFieldError>
      </SoneField>,
    );
    expect(screen.getByRole("group")).toBeTruthy();
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });
});

describe("SoneInputGroup", () => {
  it("frames a control with addons", () => {
    const onValueChange = vi.fn();
    render(
      <SoneInputGroup aria-label="Price">
        <SoneInputGroupAddon align="inline-end">
          <SoneInputGroupText>EUR</SoneInputGroupText>
        </SoneInputGroupAddon>
        <SoneInputGroupInput
          aria-label="Amount"
          onValueChange={onValueChange}
        />
      </SoneInputGroup>,
    );
    expect(screen.getByRole("group", { name: "Price" })).toBeTruthy();
    expect(screen.getByText("EUR")).toBeTruthy();
    type(screen.getByRole("textbox", { name: "Amount" }), "12");
    expect(onValueChange).toHaveBeenCalledWith("12");
  });
});

describe("SonePasswordInput", () => {
  it("hides the password until the toggle shows it", () => {
    const onVisibleChange = vi.fn();
    const { container } = render(
      <SonePasswordInput
        aria-label="Password"
        onVisibleChange={onVisibleChange}
      />,
    );
    const field = () => container.querySelector("input") as HTMLInputElement;
    expect(field().type).toBe("password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toggle);
    expect(onVisibleChange).toHaveBeenCalledWith(true);
    expect(field().type).toBe("text");
    expect(toggle.getAttribute("aria-checked")).toBe("true");
  });
});

describe("SoneSearchField", () => {
  it("is a searchbox that submits and clears", () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    render(
      <SoneSearchField
        clearable
        onSubmit={onSubmit}
        onValueChange={onValueChange}
      />,
    );
    const box = screen.getByRole("searchbox", {
      name: "Search",
    }) as HTMLInputElement;
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    type(box, "cats");
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("cats");
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(box.value).toBe("");
  });
});

describe("SoneInputNumber", () => {
  it("steps within min / max", () => {
    const onValueChange = vi.fn();
    render(
      <SoneInputNumber
        aria-label="Guests"
        defaultValue={1}
        min={1}
        max={2}
        onValueChange={onValueChange}
      />,
    );
    const spin = screen.getByRole("spinbutton", { name: "Guests" });
    const minus = screen.getByRole("button", { name: "Decrease" });
    const plus = screen.getByRole("button", { name: "Increase" });
    expect(spin.getAttribute("aria-valuenow")).toBe("1");
    expect(minus.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(plus);
    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(spin.getAttribute("aria-valuenow")).toBe("2");
    expect(plus.getAttribute("aria-disabled")).toBe("true");
  });

  it("parses and clamps typed text on blur", () => {
    const onValueChange = vi.fn();
    render(
      <SoneInputNumber
        aria-label="Qty"
        max={10}
        step={0.5}
        onValueChange={onValueChange}
      />,
    );
    const spin = screen.getByRole("spinbutton") as HTMLInputElement;
    type(spin, "42");
    fireEvent.blur(spin);
    expect(onValueChange).toHaveBeenCalledWith(10);
    expect(spin.value).toBe("10");
  });
});

describe("SoneInputOtp", () => {
  it("keeps the allowed characters and completes", () => {
    const onComplete = vi.fn();
    render(
      <SoneInputOtp
        aria-label="Code"
        length={4}
        groups={[2, 2]}
        onComplete={onComplete}
      />,
    );
    const input = screen.getByRole("textbox", {
      name: "Code",
    }) as HTMLInputElement;
    type(input, "1a2");
    expect(input.value).toBe("12");
    expect(onComplete).not.toHaveBeenCalled();
    type(input, "123456");
    expect(input.value).toBe("1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
    expect(screen.getByText("3")).toBeTruthy();
  });
});

describe("SoneSwitch", () => {
  it("is a named switch that toggles", () => {
    const onCheckedChange = vi.fn();
    render(<SoneSwitch aria-label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    act(() => {
      fireEvent.click(sw);
    });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });

  it("does not toggle while disabled and follows a controlled value", () => {
    const onCheckedChange = vi.fn();
    render(
      <>
        <SoneSwitch aria-label="A" disabled onCheckedChange={onCheckedChange} />
        <SoneSwitch aria-label="B" checked size="sm" />
      </>,
    );
    const a = screen.getByRole("switch", { name: "A" });
    expect(a.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(a);
    expect(onCheckedChange).not.toHaveBeenCalled();
    const b = screen.getByRole("switch", { name: "B" });
    fireEvent.click(b);
    expect(b.getAttribute("aria-checked")).toBe("true");
  });
});
