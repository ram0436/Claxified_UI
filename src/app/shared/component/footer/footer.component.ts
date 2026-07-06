import { Component } from "@angular/core";
import { FOOTER_DATA } from "./footer.config";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent {
  footerSections = FOOTER_DATA;

  isRouteSection(
    section: any
  ): section is { type: "route"; links: { label: string; slug: string }[] } {
    return section.type === "route";
  }
}
