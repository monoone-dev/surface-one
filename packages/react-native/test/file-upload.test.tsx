import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SoneFileUpload } from "../src/components/file-upload";

const photo = {
  name: "photo.png",
  size: 1200,
  type: "image/png",
  uri: "file:///photo.png",
};
const doc = {
  name: "brief.pdf",
  size: 300,
  type: "application/pdf",
  uri: "file:///brief.pdf",
};
const zip = {
  name: "all.zip",
  size: 10,
  type: "application/zip",
  uri: "file:///all.zip",
};

describe("SoneFileUpload", () => {
  it("runs the app's picker, keeps what the rules accept and names the rest", async () => {
    const onValueChange = vi.fn();
    render(
      <SoneFileUpload
        multiple
        accept="image/*,.pdf"
        maxFiles={2}
        pick={async () => [photo, zip, doc]}
        onValueChange={onValueChange}
      />,
    );
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Drop files here or click to browse",
        }),
      );
    });
    expect(onValueChange).toHaveBeenLastCalledWith([photo, doc]);
    expect(screen.getByRole("alert").textContent).toBe(
      "all.zip is not an accepted file type.",
    );
    expect(screen.getByText("brief.pdf")).toBeTruthy();
    expect(screen.getByText("300 B")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove photo.png" }));
    expect(onValueChange).toHaveBeenLastCalledWith([doc]);
  });
});
