import { useState } from "react";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneInputOtp,
} from "@surface-one/react";

export default function InputOtpDemo() {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  return (
    <div className="demo-stack" style={{ maxWidth: "28rem" }}>
      <SoneField invalid={wrong}>
        <SoneFieldLabel htmlFor="demo-otp">Verification code</SoneFieldLabel>
        <SoneInputOtp
          value={code}
          onValueChange={setCode}
          inputId="demo-otp"
          groups={[3, 3]}
          invalid={wrong}
          onComplete={(value) => setWrong(value !== "123456")}
        />
        {wrong ? (
          <SoneFieldError>That code didn’t match. Try 123456.</SoneFieldError>
        ) : (
          <SoneFieldDescription>We sent a 6-digit code to your email.</SoneFieldDescription>
        )}
      </SoneField>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-otp-2fa">Authenticator code</SoneFieldLabel>
        <SoneInputOtp inputId="demo-otp-2fa" disabled />
      </SoneField>
    </div>
  );
}
