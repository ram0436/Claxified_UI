import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import { EventCategory, EventItem, EventSubCategory } from '../../model/Event';

const CATEGORY_ICONS: Record<string, string> = {
  technology: 'memory',
  business: 'work',
  entertainment: 'theater_comedy',
  sports: 'sports_soccer',
};

const PRICE_BUCKETS = [
  { key: 'free', label: 'Free', test: (p: number, free: boolean) => free },
  { key: 'u500', label: 'Under \u20B9500', test: (p: number, free: boolean) => !free && p < 500 },
  { key: '500-1000', label: '\u20B9500 - \u20B91,000', test: (p: number, free: boolean) => !free && p >= 500 && p <= 1000 },
  { key: '1000-2500', label: '\u20B91,000 - \u20B92,500', test: (p: number, free: boolean) => !free && p > 1000 && p <= 2500 },
  { key: '2500+', label: '\u20B92,500+', test: (p: number, free: boolean) => !free && p > 2500 },
];

const AGE_GROUPS = [
  { key: 'all', label: 'All Ages' },
  { key: '18+', label: '18+' },
  { key: '21+', label: '21+' },
];

const PAGE_SIZE = 8;

@Component({
  selector: 'app-events-by-category',
  templateUrl: './events-by-category.component.html',
  styleUrls: ['./events-by-category.component.css'],
})
export class EventsByCategoryComponent implements OnInit {
  category?: EventCategory;
  subCategories: EventSubCategory[] = [];
  events: EventItem[] = [];

  loading = true;
  error = false;

  searchQuery = '';
  location = 'Bengaluru';
  dateFrom = '';
  dateTo = '';
  selectedSubCategoryIds = new Set<number>();
  selectedPriceBuckets = new Set<string>();
  selectedAgeGroups = new Set<string>();
  sortBy: 'date' | 'price-asc' | 'price-desc' = 'date';
  viewMode: 'grid' | 'list' = 'grid';
  currentPage = 1;

  priceBuckets = PRICE_BUCKETS;
  ageGroups = AGE_GROUPS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      this.loadCategory(slug);
    });
  }

  loadCategory(slug: string): void {
    this.loading = true;
    this.error = false;
    this.clearFilters();

    forkJoin({
      categories: this.eventService.getCategories(),
      subCategories: this.eventService.getSubCategories(),
      events: this.eventService.getEvents(),
    }).subscribe({
      next: ({ categories, subCategories, events }) => {
        this.category = categories.find((c) => c.slug === slug) || categories[0];
        this.subCategories = subCategories.filter(
          (sc) => sc.eventCategoryId === this.category?.id
        );
        this.events = events
          .filter((e) => e.eventCategoryId === this.category?.id)
          .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  categoryIcon(): string {
    return CATEGORY_ICONS[this.category?.slug || ''] || 'event';
  }

  subCategoryCount(id: number): number {
    return this.events.filter((e) => e.eventSubCategoryId === id).length;
  }

  toggleSubCategory(id: number): void {
    this.selectedSubCategoryIds.has(id)
      ? this.selectedSubCategoryIds.delete(id)
      : this.selectedSubCategoryIds.add(id);
    this.currentPage = 1;
  }

  togglePriceBucket(key: string): void {
    this.selectedPriceBuckets.has(key)
      ? this.selectedPriceBuckets.delete(key)
      : this.selectedPriceBuckets.add(key);
    this.currentPage = 1;
  }

  toggleAgeGroup(key: string): void {
    this.selectedAgeGroups.has(key)
      ? this.selectedAgeGroups.delete(key)
      : this.selectedAgeGroups.add(key);
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedSubCategoryIds.clear();
    this.selectedPriceBuckets.clear();
    this.selectedAgeGroups.clear();
    this.currentPage = 1;
  }

  get filteredEvents(): EventItem[] {
    let result = this.events;

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    if (this.dateFrom) {
      const from = new Date(this.dateFrom).getTime();
      result = result.filter((e) => new Date(e.startDateTime).getTime() >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo).getTime();
      result = result.filter((e) => new Date(e.startDateTime).getTime() <= to);
    }

    if (this.selectedSubCategoryIds.size > 0) {
      result = result.filter((e) => this.selectedSubCategoryIds.has(e.eventSubCategoryId));
    }

    if (this.selectedPriceBuckets.size > 0) {
      result = result.filter((e) =>
        PRICE_BUCKETS.some((b) => this.selectedPriceBuckets.has(b.key) && b.test(e.price, e.isFree))
      );
    }

    const sorted = [...result];
    if (this.sortBy === 'date') {
      sorted.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    } else if (this.sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
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

  eventBadge(e: EventItem): string | null {
    if (e.isFeatured) return 'Featured';
    if (e.isTrending) return 'Trending';
    const created = new Date(e.createdAt).getTime();
    if (!isNaN(created) && Date.now() - created < 7 * 24 * 3600000) return 'New';
    return null;
  }

  dayOf(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  monthOf(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  timeRange(e: EventItem): string {
    const start = new Date(e.startDateTime);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} Onwards`;
  }

  priceLabel(e: EventItem): string {
    return e.isFree ? 'Free Entry' : `\u20B9${e.price.toLocaleString('en-IN')} Onwards`;
  }

  subCategoryName(id: number): string {
    return this.subCategories.find((s) => s.id === id)?.name || '';
  }

  goToEvent(e: EventItem): void {
    this.router.navigate(['/events/event', e.slug]);
  }
}
