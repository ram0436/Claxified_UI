import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventService } from '../../service/event.service';
import {
  EventCategory,
  EventItem,
  EventOrganizer,
  EventSubCategory,
  EventVenue,
} from '../../model/Event';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event?: EventItem;
  category?: EventCategory;
  subCategory?: EventSubCategory;
  venue?: EventVenue;
  organizer?: EventOrganizer;
  similarEvents: EventItem[] = [];

  loading = true;
  error = false;

  activeTab: 'overview' | 'details' | 'venue' | 'organizer' | 'faqs' | 'reviews' = 'overview';
  location = 'Bengaluru';

  eventHighlights = [
    { icon: 'photo_camera', label: 'Hands-on Learning' },
    { icon: 'groups', label: 'Expert Guidance' },
    { icon: 'image', label: 'Outdoor Photo Walk' },
    { icon: 'settings', label: 'Camera & Mobile Tips' },
    { icon: 'diversity_3', label: 'Meet Fellow Attendees' },
    { icon: 'card_giftcard', label: 'Free Entry' },
  ];

  shareLinks = [
    { icon: 'facebook', link: 'https://facebook.com', className: 'facebook' },
    { icon: 'chat', link: 'https://wa.me/', className: 'whatsapp' },
    { icon: 'close', link: 'https://x.com/intent/tweet', className: 'x' },
    { icon: 'work', link: 'https://linkedin.com/sharing', className: 'linkedin' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      this.loadEvent(slug);
    });
  }

  loadEvent(slug: string): void {
    this.loading = true;
    this.error = false;

    // No single-event-by-slug endpoint exists yet, so resolve from the full list.
    this.eventService.getEvents().subscribe({
      next: (allEvents) => {
        const match = allEvents.find((e) => e.slug === slug);
        if (!match) {
          this.loading = false;
          this.error = true;
          return;
        }
        this.event = match;

        this.similarEvents = allEvents
          .filter((e) => e.eventCategoryId === match.eventCategoryId && e.id !== match.id)
          .slice(0, 4);

        forkJoin({
          categories: this.eventService.getCategories(),
          subCategories: this.eventService.getSubCategories(),
          venue: this.eventService.getVenueById(match.eventVenueId).pipe(catchError(() => of(undefined))),
          organizer: this.eventService
            .getOrganizerById(match.eventOrganizerId)
            .pipe(catchError(() => of(undefined))),
        }).subscribe({
          next: ({ categories, subCategories, venue, organizer }) => {
            this.category = categories.find((c) => c.id === match.eventCategoryId);
            this.subCategory = subCategories.find((sc) => sc.id === match.eventSubCategoryId);
            this.venue = venue;
            this.organizer = organizer;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.error = true;
          },
        });
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  formattedDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  timeRange(): string {
    if (!this.event) return '';
    const start = new Date(this.event.startDateTime);
    const end = new Date(this.event.endDateTime);
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${fmt(start)} \u2013 ${fmt(end)}`;
  }

  priceLabel(): string {
    if (!this.event) return '';
    return this.event.isFree ? 'No ticket required. Just show up and be a part of it!' : `\u20B9${this.event.price.toLocaleString('en-IN')} per ticket`;
  }

  dayOf(dateStr?: string): string {
    return dateStr ? new Date(dateStr).getDate().toString().padStart(2, '0') : '';
  }

  monthOf(dateStr?: string): string {
    return dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  }

  goToEvent(e: EventItem): void {
    this.router.navigate(['/events/event', e.slug]);
  }
}
