import { Fragment } from "react";
import { SoneScrollArea, SoneSeparator } from "@surface-one/react";

const tags = Array.from({ length: 30 }, (_, i) => `v1.2.0-beta.${30 - i}`);
const swatches = ["accent", "accent-soft", "surface-hover", "success", "warning", "danger"];

export default function ScrollAreaDemo() {
  return (
    <div className="demo-row" style={{ alignItems: "flex-start" }}>
      <SoneScrollArea
        aria-label="Release tags"
        style={{ height: "14rem", width: "12rem", padding: "var(--space-4)", border: "var(--border-width-thin) solid var(--border)", borderRadius: "var(--radius-md)" }}
      >
        <p style={{ margin: "0 0 var(--space-3)", fontWeight: "var(--font-weight-medium)" }}>Tags</p>
        {tags.map((tag) => (
          <Fragment key={tag}>
            <div style={{ fontSize: "var(--font-size-sm)" }}>{tag}</div>
            <SoneSeparator style={{ marginBlock: "var(--space-2)" }} />
          </Fragment>
        ))}
      </SoneScrollArea>
      <div style={{ width: "18rem", border: "var(--border-width-thin) solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <SoneScrollArea orientation="horizontal" fade aria-label="Swatches">
          <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", width: "max-content" }}>
            {swatches.map((swatch) => (
              <div key={swatch} style={{ display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
                <div
                  style={{ background: `var(--${swatch})`, width: "6rem", height: "6rem", borderRadius: "var(--radius-md)", border: "var(--border-width-thin) solid var(--border)" }}
                />
                <code style={{ fontSize: "var(--font-size-xs)" }}>--{swatch}</code>
              </div>
            ))}
          </div>
        </SoneScrollArea>
      </div>
    </div>
  );
}
