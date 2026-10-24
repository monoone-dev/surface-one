import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneHoverCard,
  SoneHoverCardContent,
  SoneHoverCardTrigger,
} from "@surface-one/react";

export default function HoverCardDemo() {
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", minHeight: "11rem" }}>
      <SoneHoverCard openDelay={300}>
        <SoneHoverCardTrigger
          href="#ada-park"
          style={{ fontWeight: "var(--font-weight-medium)", textDecoration: "underline", textUnderlineOffset: "var(--space-1)" }}
        >
          @adapark
        </SoneHoverCardTrigger>
        <SoneHoverCardContent>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <SoneAvatar>
              <SoneAvatarFallback>AP</SoneAvatarFallback>
            </SoneAvatar>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <strong>Ada Park</strong>
              <span>Product design. Writes up every sync within the hour.</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-xs)" }}>Joined March 2021</span>
            </div>
          </div>
        </SoneHoverCardContent>
      </SoneHoverCard>
    </div>
  );
}
