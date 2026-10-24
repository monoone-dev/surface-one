import {
  SoneBreadcrumb,
  SoneBreadcrumbEllipsis,
  SoneBreadcrumbItem,
  SoneBreadcrumbLink,
  SoneBreadcrumbList,
  SoneBreadcrumbPage,
  SoneBreadcrumbSeparator,
} from "@surface-one/react";

export default function BreadcrumbDemo() {
  return (
    <SoneBreadcrumb>
      <SoneBreadcrumbList>
        <SoneBreadcrumbItem><SoneBreadcrumbLink href="#">Home</SoneBreadcrumbLink></SoneBreadcrumbItem>
        <SoneBreadcrumbSeparator />
        <SoneBreadcrumbItem><SoneBreadcrumbEllipsis /></SoneBreadcrumbItem>
        <SoneBreadcrumbSeparator />
        <SoneBreadcrumbItem><SoneBreadcrumbLink href="#">Settings</SoneBreadcrumbLink></SoneBreadcrumbItem>
        <SoneBreadcrumbSeparator />
        <SoneBreadcrumbItem><SoneBreadcrumbPage>Billing</SoneBreadcrumbPage></SoneBreadcrumbItem>
      </SoneBreadcrumbList>
    </SoneBreadcrumb>
  );
}
