import { useState } from "react";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneInputNumber } from "@surface-one/react";

export default function InputNumberDemo() {
  const [qty, setQty] = useState<number | null>(2);
  const [weight, setWeight] = useState<number | null>(1.5);
  return (
    <div className="demo-stack" style={{ maxWidth: "20rem" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-qty">Quantity</SoneFieldLabel>
        <SoneInputNumber value={qty} onValueChange={setQty} inputId="demo-qty" min={1} max={10} />
        <SoneFieldDescription>
          {qty} × €24.00 = €{((qty ?? 0) * 24).toFixed(2)}
        </SoneFieldDescription>
      </SoneField>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-weight">Weight (kg)</SoneFieldLabel>
        <SoneInputNumber value={weight} onValueChange={setWeight} inputId="demo-weight" size="sm" min={0} step={0.5} />
      </SoneField>
    </div>
  );
}
