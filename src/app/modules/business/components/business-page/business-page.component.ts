import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BUSINESS_PAGE_DATA } from "./../../model/business-page-data";

@Component({
  selector: "app-business-page",
  templateUrl: "./business-page.component.html",
  styleUrls: ["./business-page.component.css"],
})
export class BusinessPageComponent implements OnInit {
  pageData: any;
  slug: string = "";

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.slug = params["slug"];
      this.pageData = BUSINESS_PAGE_DATA[this.slug];
    });
  }
}
