import { useState } from "react";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneFileUpload } from "@surface-one/react";

export default function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="demo-stack" style={{ maxWidth: "28rem" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-attachments">Attachments</SoneFieldLabel>
        <SoneFileUpload
          value={files}
          onValueChange={setFiles}
          inputId="demo-attachments"
          multiple
          accept="image/*,.pdf"
          maxSize={2000000}
          maxFiles={4}
          description="PNG, JPG or PDF, up to 2 MB each"
        />
        <SoneFieldDescription>Up to four files, attached to the meeting notes.</SoneFieldDescription>
      </SoneField>
    </div>
  );
}
