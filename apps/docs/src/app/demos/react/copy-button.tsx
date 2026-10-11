import { SoneCopyButton } from "@surface-one/react";

export default function CopyButtonDemo() {
  return (
    <div className="demo-row" style={{ alignItems: "center" }}>
      <SoneCopyButton value="npm install @surface-one/react" />
      <SoneCopyButton value="mtg_01J9ZK3Q7R4M2" label="Copy meeting ID" iconOnly variant="ghost" />
      <SoneCopyButton value={'{ "mcpServers": {} }'} label="Copy config" variant="secondary" />
    </div>
  );
}
