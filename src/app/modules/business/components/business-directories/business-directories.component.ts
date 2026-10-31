import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessService } from '../../service/business.service';
import { BusinessDirectoryItem } from './../../model/Business';
import { buildBusinessCommands } from '../../../business/utils/business-url.util';
import { BusinessAnalyticsTracker } from '../../service/business-analytics-tracker.service';
import { BusinessAnalyticsEventType } from '../../model/business-analytics';

@Component({
  selector: 'app-business-directories',
  templateUrl: './business-directories.component.html',
  styleUrls: ['./business-directories.component.css'],
})
export class BusinessDirectoriesComponent implements OnInit, OnDestroy {
  businesses: BusinessDirectoryItem[] = [];
  loading: boolean = true;
  loadError: boolean = false;

  private impressionObserver?: IntersectionObserver;

  constructor(
    private businessService: BusinessService,
    private router: Router,
    private tracker: BusinessAnalyticsTracker,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngOnDestroy(): void {
    this.impressionObserver?.disconnect();
  }

  ngOnInit(): void {
    this.fetchBusinesses();
  }

  getYearsInBusiness(establishedYear: number): number {
    return Math.max(1, new Date().getFullYear() - establishedYear);
  }

  fetchBusinesses(): void {
    this.loading = true;
    this.loadError = false;
    this.businessService.getBusinessList().subscribe(
      (data: BusinessDirectoryItem[]) => {
        this.businesses = (data || []).filter((b) => b.status !== 0);
        this.loading = false;
        // Wait for the cards to render before observing them.
        setTimeout(() => this.observeImpressions());
      },
      () => {
        this.loadError = true;
        this.loading = false;
      },
    );
  }

  /** A business "appears in search" once its card is at least half visible. */
  private observeImpressions(): void {
    this.impressionObserver?.disconnect();
    if (typeof IntersectionObserver === 'undefined') return;

    const userId = Number(localStorage.getItem('id'));
    this.impressionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          this.impressionObserver?.unobserve(el);

          const id = Number(el.dataset['bizId']);
          const business = this.businesses.find((b) => b.id === id);
          if (!business || (userId && business.userId === userId)) return;
          this.tracker.trackBusiness(
            id,
            BusinessAnalyticsEventType.SearchAppearance,
            { once: true },
          );
        });
      },
      { threshold: 0.5 },
    );

    this.host.nativeElement
      .querySelectorAll<HTMLElement>('.business-card[data-biz-id]')
      .forEach((el) => this.impressionObserver!.observe(el));
  }

  private trackCardAction(
    business: BusinessDirectoryItem | undefined,
    type: BusinessAnalyticsEventType,
  ): void {
    if (!business) return;
    const userId = Number(localStorage.getItem('id'));
    if (userId && business.userId === userId) return;
    this.tracker.trackBusiness(business.id, type);
  }

  viewBusiness(business: BusinessDirectoryItem): void {
    if (!business.tabRefGUID) return;
    const cmds = buildBusinessCommands(business);
    if (cmds) this.router.navigate(cmds);
  }

  trackByBusinessId(_index: number, business: BusinessDirectoryItem): number {
    return business.id;
  }

  getLocationLabel(business: BusinessDirectoryItem): string {
    const addr = business.businessAddressDto;
    if (!addr) return '';
    return [addr.area, addr.city].filter((part) => !!part).join(', ');
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return '?';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }

  /**
   * true  -> open right now
   * false -> closed right now (either marked closed today, or outside hours)
   * null  -> no usable working-hours data for today, so we don't claim either way
   */
  isOpenNow(business: BusinessDirectoryItem): boolean | null {
    const hours = business.businessWorkingHoursDtoList;
    if (!hours || hours.length === 0) return null;

    const now = new Date();
    const today = hours.find((h) => h.dayOfWeek === now.getDay());
    if (!today) return null;
    if (today.isClosed) return false;

    const openMinutes = this.toMinutes(today.openTime);
    const closeMinutes = this.toMinutes(today.closeTime);
    if (openMinutes === null || closeMinutes === null) return null;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  }

  private toMinutes(time: string): number | null {
    if (!time) return null;
    const [h, m] = time.split(':').map((v) => parseInt(v, 10));
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  callBusiness(
    event: Event,
    mobile: string | undefined,
    business?: BusinessDirectoryItem,
  ): void {
    event.stopPropagation();
    this.trackCardAction(business, BusinessAnalyticsEventType.Call);
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    }
  }

  whatsappBusiness(
    event: Event,
    whatsApp: string | undefined,
    business?: BusinessDirectoryItem,
  ): void {
    event.stopPropagation();
    this.trackCardAction(business, BusinessAnalyticsEventType.WhatsAppClick);
    if (!whatsApp) return;
    const cleaned = whatsApp.replace(/[^0-9]/g, '');
    if (cleaned) {
      window.open(`https://wa.me/${cleaned}`, '_blank');
    }
  }
}
