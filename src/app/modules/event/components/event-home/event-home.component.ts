import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import { EventCategory, EventItem } from '../../model/Event';

const CATEGORY_ICONS: Record<string, string> = {
  technology: 'memory',
  business: 'work',
  entertainment: 'theater_comedy',
  sports: 'sports_soccer',
  'music-concerts': 'music_note',
  workshops: 'school',
  exhibitions: 'photo_library',
  'food-drinks': 'restaurant',
  family: 'diversity_3',
  community: 'groups',
};

@Component({
  selector: 'app-event-home',
  templateUrl: './event-home.component.html',
  styleUrls: ['./event-home.component.css'],
})
export class EventHomeComponent implements OnInit {
  location = 'Bengaluru';
  searchQuery = '';
  dateFilter = '';

  categories: EventCategory[] = [];
  events: EventItem[] = [];

  loading = true;
  error = false;

  popularSearches = [
    'Concerts',
    'Workshops',
    'Exhibitions',
    'Festivals',
    'Sports',
  ];

  quickLinks = [
    {
      icon: 'celebration',
      title: 'Live Shows & Concerts',
      subtitle: 'Experience amazing live performances',
    },
    {
      icon: 'school',
      title: 'Workshops & Classes',
      subtitle: 'Learn new skills & grow',
    },
    {
      icon: 'palette',
      title: 'Exhibitions & Fairs',
      subtitle: 'Explore, connect & inspire',
    },
  ];

  whyList = [
    {
      icon: 'live_tv',
      title: 'Free Event Listing',
      subtitle: 'Reach more people',
    },
    {
      icon: 'groups',
      title: 'Targeted Audience',
      subtitle: 'Local & relevant',
    },
    { icon: 'settings', title: 'Easy Management', subtitle: 'Simple & quick' },
    {
      icon: 'visibility',
      title: 'Boost Visibility',
      subtitle: 'Get more attendees',
    },
  ];

  constructor(
    private eventService: EventService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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

  get featuredEvents(): EventItem[] {
    return this.events.filter((e) => e.isFeatured).slice(0, 5);
  }

  get topPicks(): EventItem[] {
    return [...this.events]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3);
  }

  get upcomingThisWeekend(): EventItem[] {
    const now = Date.now();
    const weekMs = 7 * 24 * 3600000;
    return this.events
      .filter((e) => {
        const start = new Date(e.startDateTime).getTime();
        return start >= now && start <= now + weekMs;
      })
      .slice(0, 2);
  }

  categoryIcon(cat: EventCategory): string {
    return CATEGORY_ICONS[cat.slug] || 'event';
  }

  // Event counts per category aren't returned by the categories API,
  // so this derives a live count from the loaded events list.
  categoryCount(cat: EventCategory): number {
    return this.events.filter((e) => e.eventCategoryId === cat.id).length;
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
    const startStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${startStr} Onwards`;
  }

  priceLabel(e: EventItem): string {
    return e.isFree
      ? 'Free Entry'
      : `\u20B9${e.price.toLocaleString('en-IN')} Onwards`;
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
