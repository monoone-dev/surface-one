import { useState } from "react";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldLabel,
  SoneFieldLegend,
  SoneRadio,
  SoneRadioGroup,
} from "@surface-one/react";

export default function RadioGroupDemo() {
  const [density, setDensity] = useState("comfortable");
  return (
    <SoneRadioGroup as="fieldset" value={density} onValueChange={setDensity} style={{ maxWidth: "26rem" }}>
      <SoneFieldLegend variant="label">Density</SoneFieldLegend>
      <SoneField orientation="horizontal">
        <SoneRadio id="demo-density-default" value="default" />
        <SoneFieldLabel htmlFor="demo-density-default">Default</SoneFieldLabel>
      </SoneField>
      <SoneField orientation="horizontal">
        <SoneRadio id="demo-density-comfortable" value="comfortable" />
        <SoneFieldLabel htmlFor="demo-density-comfortable">Comfortable</SoneFieldLabel>
      </SoneField>
      <SoneField orientation="horizontal">
        <SoneRadio id="demo-density-compact" value="compact" disabled />
        <SoneFieldLabel htmlFor="demo-density-compact">Compact (soon)</SoneFieldLabel>
      </SoneField>
      <SoneFieldDescription>Rows are {density}.</SoneFieldDescription>
    </SoneRadioGroup>
  );
}
