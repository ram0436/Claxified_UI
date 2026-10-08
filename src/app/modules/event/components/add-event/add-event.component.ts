import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { EventService } from '../../service/event.service';
import { BusinessService } from 'src/app/modules/business/service/business.service';
import { CommonService } from 'src/app/shared/service/common.service';
import {
  CreateEventRequest,
  EventCategory,
  EventSubCategory,
} from '../../model/Event';
import { EventStatus, EventType } from '../../enum/event.enum';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface EventTypeOption {
  value: EventType;
  label: string;
}

const createEmptyModel = () => ({
  // Event
  eventCategoryId: null as number | null,
  eventSubCategoryId: null as number | null,
  name: '',
  slug: '',
  slugTouched: false,
  shortDescription: '',
  description: '',
  eventType: EventType.InPerson,
  startDate: null as Date | null,
  startTime: '09:00',
  endDate: null as Date | null,
  endTime: '18:00',
  isAllDay: false,
  registrationRequired: false,
  registrationUrl: '',
  ticketRequired: false,
  ticketUrl: '',
  isFree: true,
  price: null as number | null,
  isFeatured: false,
  isTrending: false,
  featuredImageUrl: '',
  featuredImageAltText: '',

  // Venue
  venueName: '',
  venueSlug: '',
  venueSlugTouched: false,
  venuePincode: '',
  venueAddress: '',
  venueCity: '',
  venueState: '',
  venueCountry: 'India',
  venueMapUrl: '',

  // Organizer
  organizerName: '',
  organizerSlug: '',
  organizerSlugTouched: false,
  organizerDescription: '',
  organizerWebsite: '',
  organizerEmail: '',
  organizerPhone: '',
});

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
})
export class AddEventComponent implements OnInit {
  // Lookups (organizers & venues are no longer loaded; backend handles them)
  categories: EventCategory[] = [];
  subCategories: EventSubCategory[] = [];
  filteredSubCategories: EventSubCategory[] = [];

  lookupsLoading = true;
  lookupsError = false;

  model = createEmptyModel();

  eventTypeOptions: EventTypeOption[] = [
    { value: EventType.InPerson, label: 'In-person' },
    { value: EventType.Online, label: 'Online' },
    { value: EventType.Hybrid, label: 'Hybrid' },
  ];

  submitting = false;
  imageUploading = false;
  pincodeInvalid = false;

  constructor(
    private eventService: EventService,
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  // ---------- Rich text editor ----------
  private descriptionEditorEl?: HTMLDivElement;

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
    if (url) this.exec('createLink', url);
  }

  onDescriptionInput(el: HTMLDivElement): void {
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
    }).subscribe({
      next: ({ categories, subCategories }) => {
        this.categories = categories
          .filter((c) => c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        this.subCategories = subCategories.filter((s) => s.isActive);
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

  // ---------- Slugs ----------
  onNameChange(): void {
    if (!this.model.slugTouched) {
      this.model.slug = this.slugify(this.model.name);
    }
  }
  onSlugEdited(): void {
    this.model.slugTouched = true;
  }

  onVenueNameChange(): void {
    if (!this.model.venueSlugTouched) {
      this.model.venueSlug = this.slugify(this.model.venueName);
    }
  }
  onVenueSlugEdited(): void {
    this.model.venueSlugTouched = true;
  }

  onOrganizerNameChange(): void {
    if (!this.model.organizerSlugTouched) {
      this.model.organizerSlug = this.slugify(this.model.organizerName);
    }
  }
  onOrganizerSlugEdited(): void {
    this.model.organizerSlugTouched = true;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ---------- Venue pincode lookup (same API as business login) ----------
  onVenuePincodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.model.venuePincode = input.value;
    this.pincodeInvalid = false;

    if (input.value.length !== 6) {
      this.clearVenueAddress();
      return;
    }

    this.commonService.getAddress(input.value).subscribe({
      next: (data: any) => {
        const postOffice = data?.[0]?.PostOffice;
        if (postOffice && postOffice.length > 0) {
          const first = postOffice[0];
          this.model.venueState = first.State || '';
          this.model.venueCity = first.District || '';
          this.model.venueCountry = first.Country || 'India';
        } else {
          this.clearVenueAddress();
          this.pincodeInvalid = true;
        }
      },
      error: () => {
        this.clearVenueAddress();
        this.pincodeInvalid = true;
      },
    });
  }

  private clearVenueAddress(): void {
    this.model.venueState = '';
    this.model.venueCity = '';
  }

  // ---------- Image upload (same API as the business logo upload) ----------
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showNotification('Please choose an image file');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('Image must be smaller than 5 MB');
      input.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.imageUploading = true;
    this.businessService.uploadLogo(formData).subscribe({
      next: (url: string) => {
        this.imageUploading = false;
        this.model.featuredImageUrl = url;
      },
      error: () => {
        this.imageUploading = false;
        this.showNotification('Image upload failed. Please try again.');
      },
    });

    input.value = ''; // allows re-selecting the same file later
  }

  removeImage(): void {
    this.model.featuredImageUrl = '';
  }

  private toLocalDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

  // ---------- Validation ----------
  getMissingFields(): string[] {
    const m = this.model;
    const missing: string[] = [];

    // Event
    if (!m.name.trim()) missing.push('Event Name');
    if (!m.slug.trim()) missing.push('URL Slug');
    if (!m.eventCategoryId) missing.push('Category');
    if (!m.eventSubCategoryId) missing.push('Sub-Category');
    if (!m.startDate) missing.push('Start Date');
    if (!m.endDate) missing.push('End Date');
    if (
      this.startDateTime &&
      this.endDateTime &&
      new Date(this.endDateTime).getTime() <=
        new Date(this.startDateTime).getTime()
    ) {
      missing.push('End Date & Time (must be after Start Date & Time)');
    }
    if (m.registrationRequired && !m.registrationUrl.trim())
      missing.push('Registration URL');
    if (m.ticketRequired && !m.ticketUrl.trim()) missing.push('Ticket URL');
    if (!m.isFree && (m.price === null || m.price < 0)) missing.push('Price');
    if (this.imageUploading) missing.push('Image is still uploading');
    else if (!m.featuredImageUrl.trim()) missing.push('Event Image');

    // Venue (name + slug required, rest optional)
    if (!m.venueName.trim()) missing.push('Venue Name');
    if (!m.venueSlug.trim()) missing.push('Venue Slug');
    if (m.venuePincode && !/^[0-9]{6}$/.test(m.venuePincode))
      missing.push('Venue Pincode (must be 6 digits)');
    if (m.venuePincode.length === 6 && this.pincodeInvalid)
      missing.push('Venue Pincode (not found)');

    // Organizer (name + slug + description required, rest optional)
    if (!m.organizerName.trim()) missing.push('Organizer Name');
    if (!m.organizerSlug.trim()) missing.push('Organizer Slug');
    if (!m.organizerDescription.trim()) missing.push('Organizer Description');
    if (
      m.organizerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.organizerEmail.trim())
    ) {
      missing.push('Organizer Email (invalid format)');
    }

    return missing;
  }

  get isFormValid(): boolean {
    return this.getMissingFields().length === 0;
  }

  // ---------- Submit ----------
  submit(publish: boolean): void {
    const missing = this.getMissingFields();
    if (missing.length > 0) {
      this.showNotification(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    this.submitting = true;
    const m = this.model;

    // Empty optional strings are sent as null so the backend stores nothing
    const orNull = (v: string) => (v.trim() ? v.trim() : null);

    const payload: CreateEventRequest = {
      event: {
        eventCategoryId: m.eventCategoryId!,
        eventSubCategoryId: m.eventSubCategoryId!,
        // eventOrganizerId / eventVenueId intentionally omitted (backend resolves them)
        name: m.name.trim(),
        slug: m.slug.trim(),
        shortDescription: m.shortDescription.trim(),
        description: m.description.trim(),
        eventType: m.eventType,
        startDateTime: this.startDateTime,
        endDateTime: this.endDateTime,
        isAllDay: m.isAllDay,
        registrationRequired: m.registrationRequired,
        registrationUrl: m.registrationRequired ? m.registrationUrl.trim() : '',
        ticketRequired: m.ticketRequired,
        ticketUrl: m.ticketRequired ? m.ticketUrl.trim() : '',
        price: m.isFree ? 0 : m.price || 0,
        isFree: m.isFree,
        status: publish ? EventStatus.Published : EventStatus.Draft,
        isFeatured: m.isFeatured,
        isTrending: m.isTrending,
        featuredImageUrl: m.featuredImageUrl.trim(),
        featuredImageAltText: m.featuredImageAltText.trim() || m.name.trim(),
        viewCount: 0,
        shareCount: 0,
        eventSEO: {
          metaTitle: m.name.trim(),
          metaDescription: m.shortDescription.trim(),
        },
        eventMediaList: [],
        eventEventTagList: [],
        eventAnalyticsList: [],
      },
      eventVenue: {
        // id omitted (backend handles it)
        name: m.venueName.trim(),
        slug: m.venueSlug.trim(),
        address: orNull(m.venueAddress),
        city: orNull(m.venueCity),
        state: orNull(m.venueState),
        country: orNull(m.venueCountry),
        postalCode: orNull(m.venuePincode),
        mapUrl: orNull(m.venueMapUrl),
        isActive: true,
      },
      eventOrganizer: {
        // id omitted (backend handles it)
        name: m.organizerName.trim(),
        slug: m.organizerSlug.trim(),
        description: m.organizerDescription.trim(),
        websiteUrl: orNull(m.organizerWebsite),
        email: orNull(m.organizerEmail),
        phone: orNull(m.organizerPhone),
        isVerified: false,
        isActive: true,
      },
    };

    this.eventService.createEvent(payload).subscribe({
      next: (created: any) => {
        this.submitting = false;
        this.showNotification(
          publish
            ? 'Event published successfully'
            : 'Event saved as draft successfully',
        );
        // Handles both a bare object and a {success, data} envelope
        const slug = created?.data?.slug || created?.slug || m.slug;
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
    this.model = createEmptyModel();
    this.filteredSubCategories = [];
    this.pincodeInvalid = false;
    if (this.descriptionEditorEl) {
      this.descriptionEditorEl.innerHTML = '';
    }
  }

  readonly today = new Date(new Date().setHours(0, 0, 0, 0));

  timeOptions: { value: string; label: string }[] = this.generateTimeOptions();

  private generateTimeOptions() {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const period = h < 12 ? 'AM' : 'PM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        options.push({
          value: `${hh}:${mm}`,
          label: `${hour12}:${mm} ${period}`,
        });
      }
    }
    return options;
  }

  private combine(date: Date | null, time: string): string {
    if (!date) return '';
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d}T${time}:00`;
  }

  private get startDateTime(): string {
    return this.combine(
      this.model.startDate,
      this.model.isAllDay ? '00:00' : this.model.startTime,
    );
  }

  private get endDateTime(): string {
    return this.combine(
      this.model.endDate,
      this.model.isAllDay ? '23:59' : this.model.endTime,
    );
  }

  onStartDateChange(): void {
    if (
      this.model.startDate &&
      (!this.model.endDate || this.model.endDate < this.model.startDate)
    ) {
      this.model.endDate = this.model.startDate;
    }
  }
}
