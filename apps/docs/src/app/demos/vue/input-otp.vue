<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneInputOtp,
} from "@surface-one/vue";

const code = ref("");
const wrong = ref(false);
const check = (value: string) => {
  wrong.value = value !== "123456";
};
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem">
    <SoneField :invalid="wrong">
      <SoneFieldLabel for="demo-otp">Verification code</SoneFieldLabel>
      <SoneInputOtp
        v-model="code"
        input-id="demo-otp"
        :groups="[3, 3]"
        :invalid="wrong"
        @complete="check"
      />
      <SoneFieldError v-if="wrong">That code didn’t match. Try 123456.</SoneFieldError>
      <SoneFieldDescription v-else>We sent a 6-digit code to your email.</SoneFieldDescription>
    </SoneField>
    <SoneField>
      <SoneFieldLabel for="demo-otp-2fa">Authenticator code</SoneFieldLabel>
      <SoneInputOtp input-id="demo-otp-2fa" disabled />
    </SoneField>
  </div>
</template>
