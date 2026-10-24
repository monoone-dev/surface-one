import { useState } from "react";
import {
  SoneButton,
  SoneDrawer,
  SoneDrawerDescription,
  SoneDrawerFooter,
  SoneDrawerHeader,
  SoneDrawerTitle,
} from "@surface-one/react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [snap, setSnap] = useState<number | null>(0.4);
  const [goal, setGoal] = useState(350);
  return (
    <>
      <div className="demo-row">
        <SoneButton variant="outline" type="button" onClick={() => setOpen(true)}>Open drawer</SoneButton>
        <SoneButton variant="outline" type="button" onClick={() => setSnapped(true)}>Open with snap points</SoneButton>
      </div>

      <SoneDrawer open={open} onOpenChange={setOpen}>
        <SoneDrawerHeader>
          <SoneDrawerTitle>Move goal</SoneDrawerTitle>
          <SoneDrawerDescription>Set your daily activity goal.</SoneDrawerDescription>
        </SoneDrawerHeader>
        <div className="demo-row" style={{ justifyContent: "center" }}>
          <SoneButton variant="outline" size="icon" type="button" aria-label="Decrease" onClick={() => setGoal(goal - 10)}>−</SoneButton>
          <strong style={{ fontSize: "var(--font-size-3xl)", minWidth: "6ch", textAlign: "center" }}>{goal}</strong>
          <SoneButton variant="outline" size="icon" type="button" aria-label="Increase" onClick={() => setGoal(goal + 10)}>+</SoneButton>
        </div>
        <SoneDrawerFooter>
          <SoneButton type="button" onClick={() => setOpen(false)}>Submit</SoneButton>
          <SoneButton variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</SoneButton>
        </SoneDrawerFooter>
      </SoneDrawer>

      <SoneDrawer
        open={snapped}
        onOpenChange={setSnapped}
        snapPoints={[0.4, 1]}
        activeSnapPoint={snap}
        onActiveSnapPointChange={setSnap}
      >
        <SoneDrawerHeader>
          <SoneDrawerTitle>Activity</SoneDrawerTitle>
          <SoneDrawerDescription>Drag the handle up for the whole week, down to close.</SoneDrawerDescription>
        </SoneDrawerHeader>
        <ul style={{ margin: 0, paddingInline: "var(--space-6)" }}>
          {days.map((day) => (
            <li key={day}>{day}: 30 minutes</li>
          ))}
        </ul>
      </SoneDrawer>
    </>
  );
}
