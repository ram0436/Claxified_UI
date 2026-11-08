import { Injectable } from '@angular/core';
import { BusinessService } from './business.service';
import { AnalyticsService } from '../../../services/analytics.service';
import {
  BusinessAnalyticsEventType,
  BusinessOfferingAnalyticsEventType,
  BUSINESS_EVENT_META,
  OFFERING_EVENT_META,
} from '../model/business-analytics';

export interface TrackOptions {
  once?: boolean;
}

export type TrackableKind = 'offering' | 'product' | 'service';

@Injectable({ providedIn: 'root' })
export class BusinessAnalyticsTracker {
  private readonly onceWindowMs = 30 * 60 * 1000;
  private readonly memory = new Map<string, number>();

  constructor(
    private api: BusinessService,
    private analytics: AnalyticsService,
  ) {}

  trackBusiness(
    businessId: number,
    eventType: BusinessAnalyticsEventType,
    options: TrackOptions = {},
  ): void {
    if (!businessId) return;
    const key = `clx.an.b.${businessId}.${eventType}`;
    if (!this.claim(key, options.once)) return;

    const name = BUSINESS_EVENT_META.find((m) => m.id === eventType)?.key;
    this.analytics.capture(`business_${this.snake(name)}`, {
      business_id: businessId,
    });

    this.api.trackBusinessEvent(businessId, eventType).subscribe({
      error: () => this.release(key),
    });
  }

  trackOffering(
    businessId: number,
    entityId: number,
    eventType: BusinessOfferingAnalyticsEventType,
    options: TrackOptions = {},
    kind: TrackableKind = 'offering',
  ): void {
    if (!businessId || !entityId) return;
    const key = `clx.an.${kind[0]}.${businessId}.${entityId}.${eventType}`;
    if (!this.claim(key, options.once)) return;

    const name = OFFERING_EVENT_META.find((m) => m.id === eventType)?.key;
    this.analytics.capture(`${kind}_${this.snake(name)}`, {
      business_id: businessId,
      [`${kind}_id`]: entityId,
      kind,
    });

    this.api.trackOfferingEvent(businessId, entityId, eventType).subscribe({
      error: () => this.release(key),
    });
  }

  private claim(key: string, once?: boolean): boolean {
    if (!once) return true;
    const now = Date.now();
    const last = this.read(key);
    if (last && now - last < this.onceWindowMs) return false;
    this.write(key, now);
    return true;
  }

  private release(key: string): void {
    this.memory.delete(key);
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  private read(key: string): number {
    try {
      const v = sessionStorage.getItem(key);
      if (v) return Number(v) || 0;
    } catch {}
    return this.memory.get(key) || 0;
  }

  private write(key: string, value: number): void {
    this.memory.set(key, value);
    try {
      sessionStorage.setItem(key, String(value));
    } catch {}
  }

  private snake(s?: string): string {
    return (s || 'unknown').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }
}
