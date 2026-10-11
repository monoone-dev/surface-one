import {
  SoneButton,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
} from "@surface-one/react";

export default function PageHeaderDemo() {
  return (
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Workspace</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h3">Product planning</SonePageHeaderTitle>
        <SonePageHeaderDescription>
          Notes, decisions and follow-ups from the weekly planning meeting.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <SoneButton type="button" variant="outline">Share</SoneButton>
        <SoneButton type="button">New note</SoneButton>
      </SonePageHeaderActions>
    </SonePageHeader>
  );
}
