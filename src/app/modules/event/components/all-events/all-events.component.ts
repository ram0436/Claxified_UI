import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import { EventCategory, EventItem } from '../../model/Event';
import { EventType } from '../../enum/event.enum';

const PRICE_BUCKETS = [
  { key: 'free', label: 'Free', test: (p: number, free: boolean) => free },
  {
    key: 'u500',
    label: 'Under \u20B9500',
    test: (p: number, free: boolean) => !free && p < 500,
  },
  {
    key: '500-1000',
    label: '\u20B9500 - \u20B91,000',
    test: (p: number, free: boolean) => !free && p >= 500 && p <= 1000,
  },
  {
    key: '1000+',
    label: '\u20B91,000+',
    test: (p: number, free: boolean) => !free && p > 1000,
  },
];

type QuickFilterKey = 'today' | 'tomorrow' | 'weekend' | 'free' | null;

const PAGE_SIZE = 9;

@Component({
  selector: 'app-all-events',
  templateUrl: './all-events.component.html',
  styleUrls: ['./all-events.component.css'],
})
export class AllEventsComponent implements OnInit {
  categories: EventCategory[] = [];
  events: EventItem[] = [];

  loading = true;
  error = false;

  searchQuery = '';
  location = 'Bengaluru';
  dateFilter = 'Any Date';
  categoryFilter: number | null = null;

  activeQuickFilter: QuickFilterKey = null;
  selectedDateOptions = new Set<'today' | 'tomorrow' | 'weekend'>();
  selectedCategoryIds = new Set<number>();
  selectedPriceBuckets = new Set<string>();
  selectedEventTypes = new Set<number>();

  viewMode: 'grid' | 'list' = 'grid';
  currentPage = 1;

  priceBuckets = PRICE_BUCKETS;
  eventTypeOptions = [
    { key: EventType.InPerson, label: 'In-person' },
    { key: EventType.Online, label: 'Online' },
  ];

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('q') || '';
    });
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.error = false;

    forkJoin({
      categories: this.eventService.getCategories(),
      events: this.eventService.getEvents(),
    }).subscribe({
      next: ({ categories, events }) => {
        this.categories = categories
          .filter((c) => c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        this.events = events.sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  get todayCount(): number {
    return this.events.filter((e) => this.isSameDay(e.startDateTime, 0)).length;
  }

  get tomorrowCount(): number {
    return this.events.filter((e) => this.isSameDay(e.startDateTime, 1)).length;
  }

  private isSameDay(dateStr: string, offsetDays: number): boolean {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const d = new Date(dateStr);
    return (
      d.getFullYear() === target.getFullYear() &&
      d.getMonth() === target.getMonth() &&
      d.getDate() === target.getDate()
    );
  }

  toggleQuickFilter(key: QuickFilterKey): void {
    this.activeQuickFilter = this.activeQuickFilter === key ? null : key;
    this.currentPage = 1;
  }

  quickFilterCategory(categorySlug: string): void {
    const cat = this.categories.find((c) => c.slug === categorySlug);
    if (cat) {
      this.selectedCategoryIds.clear();
      this.selectedCategoryIds.add(cat.id);
      this.currentPage = 1;
    }
  }

  toggleCategory(id: number): void {
    this.selectedCategoryIds.has(id)
      ? this.selectedCategoryIds.delete(id)
      : this.selectedCategoryIds.add(id);
    this.currentPage = 1;
  }

  togglePriceBucket(key: string): void {
    this.selectedPriceBuckets.has(key)
      ? this.selectedPriceBuckets.delete(key)
      : this.selectedPriceBuckets.add(key);
    this.currentPage = 1;
  }

  toggleEventType(key: number): void {
    this.selectedEventTypes.has(key)
      ? this.selectedEventTypes.delete(key)
      : this.selectedEventTypes.add(key);
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.activeQuickFilter = null;
    this.selectedCategoryIds.clear();
    this.selectedPriceBuckets.clear();
    this.selectedEventTypes.clear();
    this.searchQuery = '';
    this.currentPage = 1;
  }

  get filteredEvents(): EventItem[] {
    let result = this.events;

    const q = this.searchQuery.trim().toLowerCase();
    if (q) result = result.filter((e) => e.name.toLowerCase().includes(q));

    if (this.activeQuickFilter === 'today') {
      result = result.filter((e) => this.isSameDay(e.startDateTime, 0));
    } else if (this.activeQuickFilter === 'tomorrow') {
      result = result.filter((e) => this.isSameDay(e.startDateTime, 1));
    } else if (this.activeQuickFilter === 'weekend') {
      result = result.filter((e) => {
        const d = new Date(e.startDateTime).getDay();
        return d === 0 || d === 6;
      });
    } else if (this.activeQuickFilter === 'free') {
      result = result.filter((e) => e.isFree);
    }

    if (this.selectedCategoryIds.size > 0) {
      result = result.filter((e) =>
        this.selectedCategoryIds.has(e.eventCategoryId),
      );
    }

    if (this.selectedPriceBuckets.size > 0) {
      result = result.filter((e) =>
        PRICE_BUCKETS.some(
          (b) =>
            this.selectedPriceBuckets.has(b.key) && b.test(e.price, e.isFree),
        ),
      );
    }

    if (this.selectedEventTypes.size > 0) {
      result = result.filter((e) =>
        this.selectedEventTypes.has(Number(e.eventType)),
      );
    }

    return result;
  }

  get pagedEvents(): EventItem[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredEvents.slice(start, start + PAGE_SIZE);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.filteredEvents.length / PAGE_SIZE), 1);
  }

  get pageNumbers(): number[] {
    const pages = Math.min(this.totalPages, 5);
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  performSearch(): void {
    this.currentPage = 1;
  }

  eventBadge(e: EventItem): string | null {
    if (e.isFeatured) return 'Featured';
    if (e.isTrending) return 'Trending';
    const created = new Date(e.createdAt).getTime();
    if (!isNaN(created) && Date.now() - created < 7 * 24 * 3600000)
      return 'New';
    if (e.viewCount > 1000) return 'Popular';
    return null;
  }

  dayOf(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  monthOf(dateStr: string): string {
    return new Date(dateStr)
      .toLocaleDateString('en-US', { month: 'short' })
      .toUpperCase();
  }

  timeRange(e: EventItem): string {
    const start = new Date(e.startDateTime);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} Onwards`;
  }

  priceLabel(e: EventItem): string {
    return e.isFree
      ? 'Free Entry'
      : `\u20B9${e.price.toLocaleString('en-IN')} Onwards`;
  }

  categoryName(id: number): string {
    return this.categories.find((c) => c.id === id)?.name || 'Event';
  }

  goToEvent(e: EventItem): void {
    this.router.navigate(['/events/event', e.slug]);
  }
}
