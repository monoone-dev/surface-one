import { SoneButton, SoneButtonGroup } from "@surface-one/react";

export default function ButtonDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <SoneButton type="button">Default</SoneButton>
        <SoneButton type="button" variant="secondary">Secondary</SoneButton>
        <SoneButton type="button" variant="outline">Outline</SoneButton>
        <SoneButton type="button" variant="ghost">Ghost</SoneButton>
        <SoneButton type="button" variant="destructive">Destructive</SoneButton>
        <SoneButton type="button" variant="link">Link</SoneButton>
      </div>
      <div className="demo-row">
        <SoneButton type="button" size="xs">Extra small</SoneButton>
        <SoneButton type="button" size="sm">Small</SoneButton>
        <SoneButton type="button">Default</SoneButton>
        <SoneButton type="button" size="lg">Large</SoneButton>
        <SoneButton type="button" disabled>Disabled</SoneButton>
      </div>
      <SoneButtonGroup>
        <SoneButton type="button" variant="outline">Day</SoneButton>
        <SoneButton type="button" variant="outline">Week</SoneButton>
        <SoneButton type="button" variant="outline">Month</SoneButton>
      </SoneButtonGroup>
    </div>
  );
}
