import { Component, OnInit } from "@angular/core";
import { PAGE_DATA } from "../page-data";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-page",
  templateUrl: "./page.component.html",
  styleUrls: ["./page.component.css"],
})
export class PageComponent implements OnInit {
  pageData: any;
  slug: string = "";

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.slug = params["slug"];

      this.pageData = PAGE_DATA[this.slug];

      console.log(this.pageData); // debug
    });
  }
}
