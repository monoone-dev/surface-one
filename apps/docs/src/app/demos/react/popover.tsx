import {
  SoneButton,
  SoneField,
  SoneFieldLabel,
  SonePopover,
  SonePopoverContent,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
  SonePopoverTrigger,
} from "@surface-one/react";

export default function PopoverDemo() {
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", minHeight: "17rem" }}>
      <SonePopover>
        <SonePopoverTrigger as={SoneButton} variant="outline" type="button">Dimensions</SonePopoverTrigger>
        <SonePopoverContent aria-labelledby="dimensions-title">
          {(close) => (
            <>
              <SonePopoverHeader>
                <SonePopoverTitle id="dimensions-title">Dimensions</SonePopoverTitle>
                <SonePopoverDescription>Set the size of the layer.</SonePopoverDescription>
              </SonePopoverHeader>
              <SoneField>
                <SoneFieldLabel htmlFor="dimensions-width">Width</SoneFieldLabel>
                <input id="dimensions-width" type="text" defaultValue="100%" />
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="dimensions-height">Height</SoneFieldLabel>
                <input id="dimensions-height" type="text" defaultValue="25px" />
              </SoneField>
              <SoneButton size="sm" type="button" onClick={close}>Apply</SoneButton>
            </>
          )}
        </SonePopoverContent>
      </SonePopover>
    </div>
  );
}
