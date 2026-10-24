import { useState } from "react";
import { SoneResizableGroup, SoneResizableHandle, SoneResizablePanel } from "@surface-one/react";

const pane = { display: "grid", placeItems: "center", height: "100%", fontWeight: "var(--font-weight-semibold)" };

export default function ResizableDemo() {
  const [sizes, setSizes] = useState<readonly number[]>([]);
  return (
    <div className="demo-stack" style={{ maxWidth: "32rem", width: "100%" }}>
      <SoneResizableGroup
        sizes={sizes}
        onSizesChange={setSizes}
        style={{ height: "14rem", border: "var(--border-width-thin) solid var(--border)", borderRadius: "var(--radius-lg)" }}
      >
        <SoneResizablePanel defaultSize={30} minSize={15} collapsible>
          <div style={pane}>Sidebar</div>
        </SoneResizablePanel>
        <SoneResizableHandle withHandle />
        <SoneResizablePanel defaultSize={70} minSize={30}>
          <SoneResizableGroup direction="vertical">
            <SoneResizablePanel defaultSize={60}>
              <div style={pane}>Content</div>
            </SoneResizablePanel>
            <SoneResizableHandle />
            <SoneResizablePanel defaultSize={40}>
              <div style={pane}>Console</div>
            </SoneResizablePanel>
          </SoneResizableGroup>
        </SoneResizablePanel>
      </SoneResizableGroup>
      <p style={{ margin: 0, color: "var(--text-secondary)" }}>Sidebar: {Math.round(sizes[0] ?? 30)}%</p>
    </div>
  );
}
