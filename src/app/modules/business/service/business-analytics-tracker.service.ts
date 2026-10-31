import { Injectable } from '@angular/core';
import { BusinessService } from './business.service';
import {
  BusinessAnalyticsEventType,
  BusinessOfferingAnalyticsEventType,
} from '../model/business-analytics';

export interface TrackOptions {
  once?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BusinessAnalyticsTracker {
  private readonly onceWindowMs = 30 * 60 * 1000;
  private readonly memory = new Map<string, number>();

  constructor(private api: BusinessService) {}

  trackBusiness(
    businessId: number,
    eventType: BusinessAnalyticsEventType,
    options: TrackOptions = {},
  ): void {
    if (!businessId) return;
    const key = `clx.an.b.${businessId}.${eventType}`;
    if (!this.claim(key, options.once)) return;

    this.api.trackBusinessEvent(businessId, eventType).subscribe({
      error: () => this.release(key),
    });
  }

  trackOffering(
    businessId: number,
    offeringId: number,
    eventType: BusinessOfferingAnalyticsEventType,
    options: TrackOptions = {},
  ): void {
    if (!businessId || !offeringId) return;
    const key = `clx.an.o.${businessId}.${offeringId}.${eventType}`;
    if (!this.claim(key, options.once)) return;

    this.api.trackOfferingEvent(businessId, offeringId, eventType).subscribe({
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
}
