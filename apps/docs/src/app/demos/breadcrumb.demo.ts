import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_BREADCRUMB_PARTS } from "@surface-one/angular/breadcrumb";

const TEMPLATE = `<nav soneBreadcrumb>
  <ol soneBreadcrumbList>
    <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Home</a></li>
    <li soneBreadcrumbSeparator></li>
    <li soneBreadcrumbItem><sone-breadcrumb-ellipsis /></li>
    <li soneBreadcrumbSeparator></li>
    <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Settings</a></li>
    <li soneBreadcrumbSeparator></li>
    <li soneBreadcrumbItem><span soneBreadcrumbPage>Billing</span></li>
  </ol>
</nav>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-breadcrumb-demo",
  imports: [...SONE_BREADCRUMB_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BreadcrumbDemo {}
