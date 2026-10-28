import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import { EventCategory, EventItem } from '../../model/Event';
import { UserService } from 'src/app/modules/user/service/user.service';

@Component({
  selector: 'app-event-home',
  templateUrl: './event-home.component.html',
  styleUrls: ['./event-home.component.css'],
})
export class EventHomeComponent implements OnInit {
  searchQuery = '';

  categories: EventCategory[] = [];
  events: EventItem[] = [];

  loading = true;
  error = false;
  isAdmin = false;

  constructor(
    private eventService: EventService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.checkAdmin();
  }

  private checkAdmin(): void {
    this.isAdmin = localStorage.getItem('role') === 'Admin';
    this.userService.getData().subscribe({
      next: () => (this.isAdmin = localStorage.getItem('role') === 'Admin'),
      error: () => (this.isAdmin = false),
    });
  }

  fetchData(): void {
    this.loading = true;
    this.error = false;

    forkJoin({
      categories: this.eventService.getCategories(),
      events: this.eventService.getEvents(),
    }).subscribe({
      next: ({ categories, events }) => {
        this.categories = (categories || [])
          .filter((c) => c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        // De-dupe: API returns the same event multiple times
        const byKey = new Map<string, EventItem>();
        (events || []).forEach((e) => {
          const key = e.slug || String(e.id);
          if (!byKey.has(key)) byKey.set(key, e);
        });

        this.events = [...byKey.values()].sort(
          (a, b) => this.toTime(a.startDateTime) - this.toTime(b.startDateTime),
        );

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  // ---------- Derived views ----------

  get featuredEvents(): EventItem[] {
    return this.events
      .filter((e) => e.isFeatured)
      .sort(
        (a, b) =>
          this.toTime(b.createdAt) - this.toTime(a.createdAt) || b.id - a.id,
      )
      .slice(0, 5);
  }

  get topPicks(): EventItem[] {
    return [...this.events]
      .sort((a, b) => {
        const views = (b.viewCount ?? 0) - (a.viewCount ?? 0);
        if (views !== 0) return views;
        return this.toTime(b.createdAt) - this.toTime(a.createdAt);
      })
      .slice(0, 3);
  }

  get upcomingThisWeekend(): EventItem[] {
    const now = Date.now();
    const weekMs = 7 * 24 * 3600000;
    return this.events
      .filter((e) => {
        const start = this.toTime(e.startDateTime);
        return start >= now && start <= now + weekMs;
      })
      .slice(0, 2);
  }

  /** Popular searches are derived from the top categories instead of hardcoded. */
  get popularSearches(): string[] {
    return this.categories.slice(0, 5).map((c) => c.name);
  }

  /**
   * Quick links are derived from the first few categories — no hardcoded
   * titles. Only shown if the backend returns categories at all.
   */
  get quickLinks(): {
    icon: string;
    title: string;
    subtitle: string;
    slug: string;
  }[] {
    return this.categories.slice(0, 3).map((c) => ({
      icon: this.categoryIcon(c),
      title: c.name,
      subtitle: c.description?.trim() || `${this.categoryCount(c)} events`,
      slug: c.slug,
    }));
  }

  /** Icon comes from backend if it exposes one; otherwise a neutral default. */
  categoryIcon(cat: EventCategory): string {
    // If EventCategory ever gains an `icon` field, use it:
    // return (cat as any).icon || 'event';
    return 'event';
  }

  categoryCount(cat: EventCategory): number {
    return this.events.filter((e) => e.eventCategoryId === cat.id).length;
  }

  // ---------- Formatting ----------

  /** Badge only from backend flags — no invented thresholds. */
  eventBadge(e: EventItem): string | null {
    if (e.isFeatured) return 'Featured';
    if (e.isTrending) return 'Trending';
    return null;
  }

  dayOf(dateStr: string): string {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.getDate().toString().padStart(2, '0');
  }

  monthOf(dateStr: string): string {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  timeRange(e: EventItem): string {
    const start = new Date(e.startDateTime);
    if (isNaN(start.getTime())) return '';
    return (
      start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }) + ' Onwards'
    );
  }

  priceLabel(e: EventItem): string {
    if (e.isFree) return 'Free Entry';
    if (e.price == null || e.price <= 0) return '';
    return `₹${e.price.toLocaleString('en-IN')} Onwards`;
  }
  // ---------- Helpers ----------

  private toTime(d?: string | null): number {
    if (!d) return 0;
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  performSearch(): void {
    const queryParams: any = {};
    if (this.searchQuery.trim()) queryParams.q = this.searchQuery.trim();
    this.router.navigate(['/events/all'], { queryParams });
  }

  goToEvent(e: EventItem): void {
    this.router.navigate(['/events/event', e.slug]);
  }

  goToCategory(cat: EventCategory): void {
    this.router.navigate(['/events/categories', cat.slug]);
  }
}
