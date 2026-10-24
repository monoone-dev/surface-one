import { SoneAvatar, SoneAvatarFallback, SoneAvatarGroup } from "@surface-one/react";

const people = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Margaret Hamilton" },
];

export default function AvatarGroupDemo() {
  return (
    <div className="demo-stack">
      <SoneAvatarGroup ariaLabel="Project members" people={people} max={3} />
      <SoneAvatarGroup ariaLabel="Reviewers" size="sm">
        <SoneAvatar role="img" aria-label="Ada Lovelace">
          <SoneAvatarFallback aria-hidden="true">AL</SoneAvatarFallback>
        </SoneAvatar>
        <SoneAvatar role="img" aria-label="Grace Hopper">
          <SoneAvatarFallback aria-hidden="true">GH</SoneAvatarFallback>
        </SoneAvatar>
      </SoneAvatarGroup>
    </div>
  );
}
