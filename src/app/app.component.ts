import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Claxified - List Your Business | News | Events | Free Classified Ads";

  showCommonHeader = true;

  constructor(private router: Router) {
    // this.router.events
    //   .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    //   .subscribe((e) => {
    //     this.showCommonHeader = !e.urlAfterRedirects.startsWith("/business");
    //   });
  }
}
