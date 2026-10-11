import { useState } from "react";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneRating } from "@surface-one/react";

export default function RatingDemo() {
  const [score, setScore] = useState(0);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <SoneRating value={4.5} readonly size="sm" ariaLabel="Average rating" />
        <span className="text-hint">4.5 · 128 reviews</span>
      </div>
      <SoneField>
        <SoneFieldLabel as="span">Your rating</SoneFieldLabel>
        <SoneRating value={score} onValueChange={setScore} clearable ariaLabel="Your rating" />
        <SoneFieldDescription>
          {score ? score + " of 5" : "Not rated yet"} · choose the same star again to clear.
        </SoneFieldDescription>
      </SoneField>
      <div className="demo-row">
        <SoneRating value={3} readonly size="sm" />
        <SoneRating value={3} readonly />
        <SoneRating value={3} readonly size="lg" />
      </div>
    </div>
  );
}
