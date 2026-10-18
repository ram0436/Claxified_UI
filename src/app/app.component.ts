import { Component } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title =
    'Claxified - List Your Business | News | Events | Free Classified Ads';

  showCommonHeader = true;

  isNavigating = true;

  constructor(private router: Router) {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.isNavigating = true;
      } else if (
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ) {
        this.isNavigating = false;
        if (e instanceof NavigationEnd) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'page_view_spa',
            page_path: e.urlAfterRedirects,
            page_title: document.title,
            page_location: window.location.href,
          });
        }
      }
    });
  }
}
