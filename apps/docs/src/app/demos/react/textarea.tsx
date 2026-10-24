import { useState } from "react";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneTextarea } from "@surface-one/react";

export default function TextareaDemo() {
  const [bio, setBio] = useState("Designer in Kraków. I write about type, tokens and tidy interfaces.");
  return (
    <div className="demo-stack" style={{ maxWidth: "28rem" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-message">Message</SoneFieldLabel>
        <SoneTextarea id="demo-message" placeholder="Type your message here." />
      </SoneField>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-bio">Bio</SoneFieldLabel>
        <SoneTextarea
          id="demo-bio"
          value={bio}
          onValueChange={setBio}
          autosize
          minRows={2}
          maxRows={6}
          maxLength={160}
          showCount
        />
        <SoneFieldDescription>Grows from two to six rows. Shown on your public profile.</SoneFieldDescription>
      </SoneField>
    </div>
  );
}
