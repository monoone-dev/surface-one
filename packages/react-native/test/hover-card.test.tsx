import { act, fireEvent, render, screen } from "@testing-library/react";
import { Pressable, Text } from "react-native";
import { describe, expect, it, vi } from "vitest";

import {
  SoneHoverCard,
  SoneHoverCardContent,
  SoneHoverCardTrigger,
} from "../src/components/hover-card";

describe("SoneHoverCard", () => {
  it("previews the card on a long press, and the press still follows the link", () => {
    vi.useFakeTimers();
    const onPress = vi.fn();
    render(
      <SoneHoverCard>
        <SoneHoverCardTrigger>
          <Pressable role="link" onPress={onPress}>
            <Text>Ada Park</Text>
          </Pressable>
        </SoneHoverCardTrigger>
        <SoneHoverCardContent aria-label="Ada Park">
          <Text>Product design.</Text>
        </SoneHoverCardContent>
      </SoneHoverCard>,
    );
    expect(screen.queryByText("Product design.")).toBeNull();
    const link = screen.getByRole("link");
    fireEvent.click(link);
    expect(onPress).toHaveBeenCalled();
    act(() => {
      fireEvent.pointerDown(link, { pointerId: 1, buttons: 1 });
      fireEvent.mouseDown(link, { buttons: 1 });
      vi.advanceTimersByTime(800);
    });
    act(() => {
      fireEvent.pointerUp(link, { pointerId: 1 });
      fireEvent.mouseUp(link);
    });
    vi.useRealTimers();
    expect(screen.getByText("Product design.")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
