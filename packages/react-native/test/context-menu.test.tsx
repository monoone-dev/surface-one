import { act, fireEvent, render, screen } from "@testing-library/react";
import { Pressable, Text } from "react-native";
import { describe, expect, it, vi } from "vitest";

import {
  SoneContextMenu,
  SoneContextMenuContent,
  SoneContextMenuItem,
  SoneContextMenuLabel,
  SoneContextMenuSeparator,
  SoneContextMenuTrigger,
} from "../src/components/context-menu";

describe("SoneContextMenu", () => {
  it("opens a menu on a long press, runs an item and closes", () => {
    vi.useFakeTimers();
    const onCopy = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <SoneContextMenu onOpenChange={onOpenChange}>
        <SoneContextMenuTrigger>
          <Pressable role="button" aria-label="Photo">
            <Text>Photo</Text>
          </Pressable>
        </SoneContextMenuTrigger>
        <SoneContextMenuContent aria-label="Photo actions">
          <SoneContextMenuLabel>Photo</SoneContextMenuLabel>
          <SoneContextMenuItem onPress={onCopy}>Copy</SoneContextMenuItem>
          <SoneContextMenuSeparator />
          <SoneContextMenuItem variant="destructive">
            Delete
          </SoneContextMenuItem>
        </SoneContextMenuContent>
      </SoneContextMenu>,
    );
    expect(screen.queryByRole("menu")).toBeNull();
    const photo = screen.getByRole("button", { name: "Photo" });
    act(() => {
      fireEvent.pointerDown(photo, { pointerId: 1, buttons: 1 });
      fireEvent.mouseDown(photo, { buttons: 1 });
      vi.advanceTimersByTime(800);
    });
    act(() => {
      fireEvent.pointerUp(photo, { pointerId: 1 });
      fireEvent.mouseUp(photo);
    });
    vi.useRealTimers();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("menu", { name: "Photo actions" })).toBeTruthy();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(onCopy).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
