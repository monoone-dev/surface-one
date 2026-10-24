import { useState } from "react";
import {
  SoneAccordion,
  SoneAccordionContent,
  SoneAccordionItem,
  SoneAccordionTrigger,
  type AccordionValue,
} from "@surface-one/react";

export default function AccordionDemo() {
  const [open, setOpen] = useState<AccordionValue>("shipping");

  return (
    <SoneAccordion value={open} onValueChange={setOpen} collapsible style={{ maxWidth: "32rem" }}>
      <SoneAccordionItem value="shipping">
        <SoneAccordionTrigger>What are your shipping options?</SoneAccordionTrigger>
        <SoneAccordionContent>
          Standard delivery takes 3–5 working days; express arrives the next day.
        </SoneAccordionContent>
      </SoneAccordionItem>
      <SoneAccordionItem value="returns">
        <SoneAccordionTrigger>What is your return policy?</SoneAccordionTrigger>
        <SoneAccordionContent>
          Return any unused item within 30 days for a full refund.
        </SoneAccordionContent>
      </SoneAccordionItem>
      <SoneAccordionItem value="billing" disabled>
        <SoneAccordionTrigger>Can I change my billing plan?</SoneAccordionTrigger>
        <SoneAccordionContent>Only workspace owners can change the plan.</SoneAccordionContent>
      </SoneAccordionItem>
    </SoneAccordion>
  );
}
