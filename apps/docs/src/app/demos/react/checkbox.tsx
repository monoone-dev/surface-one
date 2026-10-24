import { useState } from "react";
import {
  SoneCheckbox,
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldGroup,
  SoneFieldLabel,
} from "@surface-one/react";

export default function CheckboxDemo() {
  const [terms, setTerms] = useState(false);
  const [partial, setPartial] = useState(true);
  return (
    <SoneFieldGroup variant="choices" style={{ maxWidth: "26rem" }}>
      <SoneField orientation="horizontal">
        <SoneCheckbox id="demo-terms" checked={terms} onCheckedChange={setTerms}
          indeterminate={partial} onIndeterminateChange={setPartial} />
        <SoneFieldContent>
          <SoneFieldLabel htmlFor="demo-terms">Accept terms and conditions</SoneFieldLabel>
          <SoneFieldDescription>{partial ? "Partly read" : terms ? "Accepted" : "Not accepted"}.</SoneFieldDescription>
        </SoneFieldContent>
      </SoneField>
      <SoneField orientation="horizontal">
        <SoneCheckbox id="demo-updates" defaultChecked />
        <SoneFieldLabel htmlFor="demo-updates">Email me product updates</SoneFieldLabel>
      </SoneField>
      <SoneField orientation="horizontal" disabled>
        <SoneCheckbox id="demo-locked" checked disabled />
        <SoneFieldLabel htmlFor="demo-locked">Keep a backup (managed)</SoneFieldLabel>
      </SoneField>
    </SoneFieldGroup>
  );
}
