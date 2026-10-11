import { useState } from "react";
import {
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneSwitch,
} from "@surface-one/react";

export default function SwitchDemo() {
  const [captions, setCaptions] = useState(true);
  const [compact, setCompact] = useState(false);
  return (
    <SoneFieldGroup variant="choices" style={{ maxWidth: "26rem" }}>
      <SoneField orientation="horizontal">
        <SoneFieldContent>
          <SoneFieldLabel htmlFor="demo-captions">Live captions</SoneFieldLabel>
          <SoneFieldDescription>{captions ? "On" : "Off"} — show text while people speak.</SoneFieldDescription>
        </SoneFieldContent>
        <SoneSwitch checked={captions} onCheckedChange={setCaptions} inputId="demo-captions" />
      </SoneField>
      <SoneField orientation="horizontal">
        <SoneFieldContent>
          <SoneFieldLabel htmlFor="demo-compact">Compact layout</SoneFieldLabel>
          <SoneFieldDescription>Small size, for dense settings lists.</SoneFieldDescription>
        </SoneFieldContent>
        <SoneSwitch checked={compact} onCheckedChange={setCompact} inputId="demo-compact" size="sm" />
      </SoneField>
      <SoneField orientation="horizontal" disabled>
        <SoneFieldContent>
          <SoneFieldLabel htmlFor="demo-sync">Cloud sync</SoneFieldLabel>
          <SoneFieldDescription>Managed by your administrator.</SoneFieldDescription>
        </SoneFieldContent>
        <SoneSwitch inputId="demo-sync" checked disabled />
      </SoneField>
    </SoneFieldGroup>
  );
}
