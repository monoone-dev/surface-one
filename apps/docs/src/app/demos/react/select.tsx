import { useState } from "react";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneSelect,
} from "@surface-one/react";

export default function SelectDemo() {
  const [language, setLanguage] = useState("en");
  return (
    <SoneFieldGroup style={{ maxWidth: "20rem" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-language">Language</SoneFieldLabel>
        <SoneSelect value={language} onValueChange={setLanguage} selectId="demo-language">
          <option value="auto">Detect automatically</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </SoneSelect>
        <SoneFieldDescription>Selected: {language}</SoneFieldDescription>
      </SoneField>
      <SoneField invalid>
        <SoneFieldLabel htmlFor="demo-workspace">Workspace</SoneFieldLabel>
        <SoneSelect selectId="demo-workspace" invalid defaultValue="">
          <option value="">Choose a workspace…</option>
          <option value="team">Team workspace</option>
        </SoneSelect>
        <SoneFieldError>Pick a workspace to continue.</SoneFieldError>
      </SoneField>
      <div className="demo-row">
        <SoneSelect size="sm" aria-label="Sort order" defaultValue="newest">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </SoneSelect>
        <SoneSelect disabled aria-label="Region (locked)" defaultValue="eu">
          <option value="eu">Europe</option>
        </SoneSelect>
      </div>
    </SoneFieldGroup>
  );
}
