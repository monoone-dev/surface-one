import { useState, type CSSProperties } from "react";
import { SoneFlow, SoneFlowControls, SoneFlowMinimap, SoneSegmented, type SoneFlowEdge, type SoneFlowEdgeType, type SoneFlowNode } from "@surface-one/react";

const types = [
  { value: "bezier", label: "Bezier" },
  { value: "step", label: "Step" },
  { value: "straight", label: "Straight" },
];

export default function FlowDemo() {
  const [edgeType, setEdgeType] = useState<SoneFlowEdgeType>("bezier");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [nodes, setNodes] = useState<readonly SoneFlowNode[]>([
    { id: "order", x: 0, y: 80, label: "Order placed", description: "Webhook", icon: "webhook", tone: "accent" },
    { id: "stock", x: 280, y: 64, label: "In stock?", shape: "diamond", outputs: ["yes", "no"] },
    { id: "ship", x: 480, y: 0, label: "Ship order", description: "Create label", icon: "truck", tone: "success" },
    { id: "notify", x: 480, y: 168, label: "Notify buyer", description: "Back-order email", icon: "mail", tone: "warning" },
    { id: "note", x: 280, y: 220, label: "Note", description: "Orders over €500 skip the stock check.", shape: "note" },
  ]);
  const [edges, setEdges] = useState<readonly SoneFlowEdge[]>([
    { id: "e1", source: "order", target: "stock", animated: true },
    { id: "e2", source: "stock", sourcePort: "yes", target: "ship", label: "Yes", tone: "success" },
    { id: "e3", source: "stock", sourcePort: "no", target: "notify", label: "No", tone: "warning" },
  ]);

  return (
    <div className="demo-stack" style={{ width: "100%" }}>
      <SoneSegmented value={edgeType} onValueChange={(v) => setEdgeType(v as SoneFlowEdgeType)} size="sm" ariaLabel="Edge style" options={types} />
      <SoneFlow
        nodes={nodes}
        onNodesChange={setNodes}
        edges={edges}
        onEdgesChange={setEdges}
        selectedNodes={selected}
        onSelectedNodesChange={setSelected}
        style={{ "--sone-flow-h": "26rem", width: "100%" } as CSSProperties}
        aria-label="Order fulfilment"
        edgeType={edgeType}
      >
        <SoneFlowControls showZoom />
        <SoneFlowMinimap />
      </SoneFlow>
    </div>
  );
}
