import { Injectable } from '@angular/core';
import posthog from 'posthog-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private enabled = false;

  init(): void {
    // if (!environment.production) return;
    posthog.init(environment.posthogKey, {
      api_host: environment.posthogHost,
      capture_pageview: false,
      person_profiles: 'identified_only',
    });
    this.enabled = true;
  }

  pageView(path: string): void {
    if (!this.enabled) return;
    posthog.capture('$pageview', { $current_url: window.location.href, path });
  }

  identify(id: string, props?: Record<string, any>): void {
    if (!this.enabled) return;
    posthog.identify(id, props);
  }

  reset(): void {
    if (!this.enabled) return;
    posthog.reset();
  }

  track(event: string, props: Record<string, any> = {}): void {
    if (this.enabled) posthog.capture(event, props);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });
  }

  capture(event: string, props: Record<string, any> = {}): void {
    if (this.enabled) posthog.capture(event, props);
  }
}
