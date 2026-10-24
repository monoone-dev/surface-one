import { useState } from "react";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldLabel,
  SoneImagePicker,
  type ImagePickerValue,
} from "@surface-one/react";

export default function ImagePickerDemo() {
  const [cover, setCover] = useState<ImagePickerValue>(null);
  return (
    <div className="demo-stack" style={{ maxWidth: "20rem" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-cover">Cover image</SoneFieldLabel>
        <SoneImagePicker
          value={cover}
          onValueChange={setCover}
          inputId="demo-cover"
          label="Add a cover"
          maxSize={2000000}
        />
        <SoneFieldDescription>PNG or JPG, up to 2 MB.</SoneFieldDescription>
      </SoneField>
    </div>
  );
}
