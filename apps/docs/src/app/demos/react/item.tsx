import {
  SoneBadge,
  SoneButton,
  SoneIcon,
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemSeparator,
  SoneItemTitle,
} from "@surface-one/react";

export default function ItemDemo() {
  return (
    <div className="demo-stack" style={{ maxWidth: "30rem" }}>
      <SoneItem variant="outline">
        <SoneItemMedia as="span" variant="icon"><SoneIcon icon="meetings" /></SoneItemMedia>
        <SoneItemContent>
          <SoneItemTitle>Weekly sync <SoneBadge variant="secondary">New</SoneBadge></SoneItemTitle>
          <SoneItemDescription>Sep 24 · 42 min · 3 action items</SoneItemDescription>
        </SoneItemContent>
        <SoneItemActions>
          <SoneButton variant="outline" size="sm" type="button">Open</SoneButton>
        </SoneItemActions>
      </SoneItem>

      <SoneItemGroup as="ul">
        <SoneItem as="li" size="sm">
          <SoneItemContent>
            <SoneItemTitle>Hiring debrief</SoneItemTitle>
            <SoneItemDescription>Ada Park · Sep 23</SoneItemDescription>
          </SoneItemContent>
        </SoneItem>
        <SoneItemSeparator as="li" />
        <SoneItem as="li" size="sm">
          <SoneItemContent>
            <SoneItemTitle>Board prep</SoneItemTitle>
            <SoneItemDescription>Leo Grant · Sep 20</SoneItemDescription>
          </SoneItemContent>
        </SoneItem>
      </SoneItemGroup>

      <SoneItem as="button" variant="muted" size="sm" type="button">
        <SoneItemMedia as="span" variant="icon"><SoneIcon icon="notes" /></SoneItemMedia>
        <SoneItemContent as="span">
          <SoneItemTitle as="span">Design review notes</SoneItemTitle>
          <SoneItemDescription as="span">The whole item is a button.</SoneItemDescription>
        </SoneItemContent>
      </SoneItem>
    </div>
  );
}
