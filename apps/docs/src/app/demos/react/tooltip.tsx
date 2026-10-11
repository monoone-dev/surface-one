import { SoneButton, SoneIcon, SoneTooltip, useSoneTooltip } from "@surface-one/react";

export default function TooltipDemo() {
  // The hook form: put the returned ref on the element.
  const searchTooltip = useSoneTooltip<HTMLButtonElement>("Search");

  return (
    <div className="demo-stack">
      <div className="demo-row">
        <SoneTooltip text="New note (⌘N)">
          <SoneButton variant="ghost" size="icon" type="button" aria-label="New note">
            <SoneIcon icon="note-add" />
          </SoneButton>
        </SoneTooltip>
        <SoneButton ref={searchTooltip} variant="ghost" size="icon" type="button" aria-label="Search">
          <SoneIcon icon="search" />
        </SoneButton>
        <SoneTooltip text="Move to trash">
          <SoneButton variant="ghost" size="icon" type="button" aria-label="Move to trash">
            <SoneIcon icon="trash" />
          </SoneButton>
        </SoneTooltip>
      </div>
      <div className="demo-row">
        <SoneTooltip text="Opens above" side="top">
          <SoneButton variant="outline" size="sm" type="button">Top</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Opens to the right" side="right">
          <SoneButton variant="outline" size="sm" type="button">Right</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Opens below (default)">
          <SoneButton variant="outline" size="sm" type="button">Bottom</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Opens to the left" side="left">
          <SoneButton variant="outline" size="sm" type="button">Left</SoneButton>
        </SoneTooltip>
        <SoneTooltip text="Shown instantly, no arrow" showDelay={0} arrow={false}>
          <SoneButton variant="outline" size="sm" type="button">No delay</SoneButton>
        </SoneTooltip>
      </div>
    </div>
  );
}
