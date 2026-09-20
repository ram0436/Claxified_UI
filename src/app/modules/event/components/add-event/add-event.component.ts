import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import {
  EventCategory,
  EventItem,
  EventOrganizer,
  EventSubCategory,
  EventVenue,
} from '../../model/Event';
import { EventStatus, EventType } from '../../enum/event.enum';

interface EventTypeOption {
  value: EventType;
  label: string;
}

interface StatusOption {
  value: EventStatus;
  label: string;
}

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
})
export class AddEventComponent implements OnInit {
  // Lookups
  categories: EventCategory[] = [];
  subCategories: EventSubCategory[] = [];
  filteredSubCategories: EventSubCategory[] = [];
  organizers: EventOrganizer[] = [];
  venues: EventVenue[] = [];

  lookupsLoading = true;
  lookupsError = false;

  // Form model
  model: {
    eventCategoryId: number | null;
    eventSubCategoryId: number | null;
    eventOrganizerId: number | null;
    eventVenueId: number | null;
    name: string;
    slug: string;
    slugTouched: boolean;
    shortDescription: string;
    description: string;
    eventType: EventType;
    startDateTime: string;
    endDateTime: string;
    isAllDay: boolean;
    registrationRequired: boolean;
    registrationUrl: string;
    ticketRequired: boolean;
    ticketUrl: string;
    isFree: boolean;
    price: number | null;
    status: EventStatus;
    isFeatured: boolean;
    isTrending: boolean;
    featuredImageUrl: string;
    featuredImageAltText: string;
  } = {
    eventCategoryId: null,
    eventSubCategoryId: null,
    eventOrganizerId: null,
    eventVenueId: null,
    name: '',
    slug: '',
    slugTouched: false,
    shortDescription: '',
    description: '',
    eventType: EventType.InPerson,
    startDateTime: '',
    endDateTime: '',
    isAllDay: false,
    registrationRequired: false,
    registrationUrl: '',
    ticketRequired: false,
    ticketUrl: '',
    isFree: true,
    price: null,
    status: EventStatus.Draft,
    isFeatured: false,
    isTrending: false,
    featuredImageUrl: '',
    featuredImageAltText: '',
  };

  eventTypeOptions: EventTypeOption[] = [
    { value: EventType.InPerson, label: 'In-person' },
    { value: EventType.Online, label: 'Online' },
    { value: EventType.Hybrid, label: 'Hybrid' },
  ];

  statusOptions: StatusOption[] = [
    { value: EventStatus.Draft, label: 'Save as Draft' },
    { value: EventStatus.Published, label: 'Publish Now' },
  ];

  submitting = false;

  constructor(
    private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  private descriptionEditorEl?: HTMLDivElement;

  // The form is inside *ngIf (hidden until lookups load), so a plain
  // ViewChild would be undefined at first. A setter runs whenever the
  // editor element is actually created.
  @ViewChild('descriptionEditor')
  set descriptionEditorRef(ref: ElementRef<HTMLDivElement> | undefined) {
    this.descriptionEditorEl = ref?.nativeElement;
    if (this.descriptionEditorEl) {
      this.descriptionEditorEl.innerHTML = this.model.description || '';
    }
  }

  exec(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
    this.descriptionEditorEl?.focus();
    if (this.descriptionEditorEl) {
      this.onDescriptionInput(this.descriptionEditorEl);
    }
  }

  insertLink(): void {
    const url = window.prompt('Enter a URL');
    if (url) {
      this.exec('createLink', url);
    }
  }

  onDescriptionInput(el: HTMLDivElement): void {
    // Treat an "empty" editor (e.g. just <br>) as an empty string
    this.model.description = el.textContent?.trim() ? el.innerHTML : '';
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  ngOnInit(): void {
    this.fetchLookups();
  }

  fetchLookups(): void {
    this.lookupsLoading = true;
    this.lookupsError = false;

    forkJoin({
      categories: this.eventService.getCategories(),
      subCategories: this.eventService.getSubCategories(),
      organizers: this.eventService.getOrganizers(),
      venues: this.eventService.getVenues(),
    }).subscribe({
      next: ({ categories, subCategories, organizers, venues }) => {
        this.categories = categories
          .filter((c) => c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        this.subCategories = subCategories.filter((s) => s.isActive);
        this.organizers = organizers.filter((o) => o.isActive);
        this.venues = venues.filter((v) => v.isActive);
        this.lookupsLoading = false;
      },
      error: () => {
        this.lookupsLoading = false;
        this.lookupsError = true;
      },
    });
  }

  onCategoryChange(): void {
    this.model.eventSubCategoryId = null;
    this.filteredSubCategories = this.model.eventCategoryId
      ? this.subCategories.filter(
          (s) => s.eventCategoryId === this.model.eventCategoryId,
        )
      : [];
  }

  onNameChange(): void {
    if (!this.model.slugTouched) {
      this.model.slug = this.slugify(this.model.name);
    }
  }

  onSlugEdited(): void {
    this.model.slugTouched = true;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private toLocalDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

  /** Returns the human-readable labels of every required field that's still missing/invalid. */
  getMissingFields(): string[] {
    const m = this.model;
    const missing: string[] = [];

    if (!m.name.trim()) missing.push('Event Name');
    if (!m.slug.trim()) missing.push('URL Slug');
    if (!m.eventCategoryId) missing.push('Category');
    if (!m.eventSubCategoryId) missing.push('Sub-Category');
    if (!m.eventOrganizerId) missing.push('Organizer');
    if (!m.eventVenueId) missing.push('Venue');
    if (!m.startDateTime) missing.push('Start Date & Time');
    if (!m.endDateTime) missing.push('End Date & Time');
    if (
      m.startDateTime &&
      m.endDateTime &&
      new Date(m.endDateTime).getTime() < new Date(m.startDateTime).getTime()
    ) {
      missing.push('End Date & Time (must be after Start Date & Time)');
    }
    if (m.registrationRequired && !m.registrationUrl.trim())
      missing.push('Registration URL');
    if (m.ticketRequired && !m.ticketUrl.trim()) missing.push('Ticket URL');
    if (!m.isFree && (m.price === null || m.price < 0)) missing.push('Price');
    if (!m.featuredImageUrl.trim()) missing.push('Featured Image URL');

    return missing;
  }

  get isFormValid(): boolean {
    return this.getMissingFields().length === 0;
  }

  submit(publish: boolean): void {
    const missing = this.getMissingFields();
    if (missing.length > 0) {
      this.showNotification(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    this.submitting = true;

    const payload: Partial<EventItem> = {
      eventCategoryId: this.model.eventCategoryId!,
      eventSubCategoryId: this.model.eventSubCategoryId!,
      eventOrganizerId: this.model.eventOrganizerId!,
      eventVenueId: this.model.eventVenueId!,
      name: this.model.name.trim(),
      slug: this.model.slug.trim(),
      shortDescription: this.model.shortDescription.trim(),
      description: this.model.description.trim(),
      eventType: this.model.eventType,
      startDateTime: this.toLocalDateTime(this.model.startDateTime),
      endDateTime: this.toLocalDateTime(this.model.endDateTime),
      isAllDay: this.model.isAllDay,
      registrationRequired: this.model.registrationRequired,
      registrationUrl: this.model.registrationRequired
        ? this.model.registrationUrl.trim()
        : '',
      ticketRequired: this.model.ticketRequired,
      ticketUrl: this.model.ticketRequired ? this.model.ticketUrl.trim() : '',
      price: this.model.isFree ? 0 : this.model.price || 0,
      isFree: this.model.isFree,
      status: publish ? EventStatus.Published : EventStatus.Draft,
      isFeatured: this.model.isFeatured,
      isTrending: this.model.isTrending,
      featuredImageUrl: this.model.featuredImageUrl.trim(),
      featuredImageAltText:
        this.model.featuredImageAltText.trim() || this.model.name.trim(),
      viewCount: 0,
      shareCount: 0,
      eventSEO: {
        metaTitle: this.model.name.trim(),
        metaDescription: this.model.shortDescription.trim(),
      },
      eventMediaList: [],
      eventEventTagList: [],
      eventAnalyticsList: [],
    };

    this.eventService.createEvent(payload).subscribe({
      next: (created) => {
        this.submitting = false;
        this.showNotification(
          publish
            ? 'Event published successfully'
            : 'Event saved as draft successfully',
        );
        const slug = created?.slug || this.model.slug;
        setTimeout(() => {
          this.router.navigate(['/events/event', slug]);
        }, 800);
      },
      error: () => {
        this.submitting = false;
        this.showNotification(
          "We couldn't publish your event right now. Please try again.",
        );
      },
    });
  }

  resetForm(): void {
    this.model = {
      eventCategoryId: null,
      eventSubCategoryId: null,
      eventOrganizerId: null,
      eventVenueId: null,
      name: '',
      slug: '',
      slugTouched: false,
      shortDescription: '',
      description: '',
      eventType: EventType.InPerson,
      startDateTime: '',
      endDateTime: '',
      isAllDay: false,
      registrationRequired: false,
      registrationUrl: '',
      ticketRequired: false,
      ticketUrl: '',
      isFree: true,
      price: null,
      status: EventStatus.Draft,
      isFeatured: false,
      isTrending: false,
      featuredImageUrl: '',
      featuredImageAltText: '',
    };
    this.filteredSubCategories = [];
    if (this.descriptionEditorEl) {
      this.descriptionEditorEl.innerHTML = '';
    }
  }
}
