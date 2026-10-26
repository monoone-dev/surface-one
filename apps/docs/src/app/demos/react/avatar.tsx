import { SoneAvatar, SoneAvatarFallback } from "@surface-one/react";

export default function AvatarDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row" style={{ alignItems: "center" }}>
        <SoneAvatar size="sm"><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
        <SoneAvatar><SoneAvatarFallback>SL</SoneAvatarFallback></SoneAvatar>
        <SoneAvatar size="lg"><SoneAvatarFallback>KM</SoneAvatarFallback></SoneAvatar>
        {/* No image and no fallback: the signed-out person glyph */}
        <SoneAvatar />
      </div>
      {/* shape="square": a team, a workspace or an app */}
      <div className="demo-row" style={{ alignItems: "center" }}>
        <SoneAvatar shape="square" size="sm"><SoneAvatarFallback>AC</SoneAvatarFallback></SoneAvatar>
        <SoneAvatar shape="square"><SoneAvatarFallback>DS</SoneAvatarFallback></SoneAvatar>
        <SoneAvatar shape="square" size="lg"><SoneAvatarFallback>IO</SoneAvatarFallback></SoneAvatar>
      </div>
      <div className="demo-row" style={{ alignItems: "center" }}>
        <SoneAvatar><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
        <div>
          <div>Ada Park</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>Product design</div>
        </div>
      </div>
    </div>
  );
}
