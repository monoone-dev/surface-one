import {
  SoneBubble,
  SoneBubbleContent,
  SoneBubbleGroup,
  type BubbleVariant,
} from "@surface-one/react";

const VARIANTS: readonly BubbleVariant[] = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
];

export default function BubbleDemo() {
  return (
    <div className="demo-stack" style={{ maxWidth: 480, width: "100%" }}>
      <SoneBubbleGroup>
        {VARIANTS.map((variant) => (
          <SoneBubble key={variant} variant={variant}>
            <SoneBubbleContent>{variant} — the agenda is in the shared doc.</SoneBubbleContent>
          </SoneBubble>
        ))}
      </SoneBubbleGroup>
      <SoneBubble align="end">
        <SoneBubbleContent>Aligned to the end, for the current user.</SoneBubbleContent>
      </SoneBubble>
    </div>
  );
}
