import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import { EventCategory, EventItem } from '../../model/Event';

const CATEGORY_IMAGES: Record<string, string> = {
  technology: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80',
  business: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&q=80',
  entertainment: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80',
};

const CATEGORY_ICONS: Record<string, string> = {
  technology: 'memory',
  business: 'work',
  entertainment: 'theater_comedy',
  sports: 'sports_soccer',
};

@Component({
  selector: 'app-all-event-categories',
  templateUrl: './all-event-categories.component.html',
  styleUrls: ['./all-event-categories.component.css'],
})
export class AllEventCategoriesComponent implements OnInit {
  categories: EventCategory[] = [];
  filteredCategories: EventCategory[] = [];
  events: EventItem[] = [];

  loading = true;
  error = false;

  searchQuery = '';
  location = 'Bengaluru';
  viewMode: 'grid' | 'list' = 'grid';

  constructor(private eventService: EventService, private router: Router) {}

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
        this.filteredCategories = this.categories;
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  onSearchChange(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredCategories = !q
      ? this.categories
      : this.categories.filter((c) => c.name.toLowerCase().includes(q));
  }

  categoryImage(cat: EventCategory): string {
    return CATEGORY_IMAGES[cat.slug] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80';
  }

  categoryIcon(cat: EventCategory): string {
    return CATEGORY_ICONS[cat.slug] || 'event';
  }

  categoryCount(cat: EventCategory): number {
    return this.events.filter((e) => e.eventCategoryId === cat.id).length;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  goToCategory(cat: EventCategory): void {
    this.router.navigate(['/events/categories', cat.slug]);
  }
}
