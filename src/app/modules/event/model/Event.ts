import { EventMediaType, EventStatus, EventType } from '../enum/event.enum';

// ==========================================================
// Lookup / master entities
// ==========================================================

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventSubCategory {
  id: number;
  eventCategoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventVenue {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventOrganizer {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================================
// Event sub-entities
// ==========================================================

export interface EventSEO {
  id?: number;
  eventId?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  robots?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventMedia {
  id: number;
  eventId: number;
  mediaType: EventMediaType | number;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  credit?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventTagMapping {
  id: number;
  eventId: number;
  eventTagId: number;
  createdAt?: string;
}

export interface EventAnalytics {
  id?: number;
  eventId?: number;
  analyticsDate?: string;
  views?: number;
  uniqueViews?: number;
  shares?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================================
// Main event entity - matches list/create response shape
// (GET /Event/list "data" items, POST /Event body)
// ==========================================================

export interface EventItem {
  id: number;
  eventCategoryId: number;
  eventSubCategoryId: number;
  eventOrganizerId: number;
  eventVenueId: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  eventType: EventType | number;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  registrationRequired: boolean;
  registrationUrl?: string | null;
  ticketRequired: boolean;
  ticketUrl?: string | null;
  price: number;
  isFree: boolean;
  status: EventStatus | number;
  isFeatured: boolean;
  isTrending: boolean;
  featuredImageUrl?: string | null;
  featuredImageAltText?: string | null;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;

  eventSEO?: EventSEO | null;
  eventMediaList?: EventMedia[];
  eventEventTagList?: EventTagMapping[];
  eventAnalyticsList?: EventAnalytics[];
}

// ==========================================================
// Envelope returned by GET /Event/list
// ==========================================================

export interface EventListResponse {
  success: boolean;
  message: string;
  data: EventItem[];
}

// ==========================================================
// UI view-model helpers (not part of the API, used by components)
// ==========================================================

export interface EventCategoryCardVm {
  category: EventCategory;
  eventCount?: number;
  imageUrl?: string;
  icon?: string;
}

export interface EventFilterState {
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  categoryIds: number[];
  priceRanges: string[];
  ageGroups: string[];
  eventTypeIds: number[];
  searchQuery?: string;
}
