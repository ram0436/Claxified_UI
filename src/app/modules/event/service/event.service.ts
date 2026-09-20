import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  EventCategory,
  EventItem,
  EventListResponse,
  EventOrganizer,
  EventSubCategory,
  EventVenue,
} from '../model/Event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = `${environment.baseUrl}Event`;

  constructor(private http: HttpClient) {}

  // ---------------------------------------------------------
  // Events
  // ---------------------------------------------------------

  /** GET /Event/list — returns the {success, message, data} envelope; unwrapped to EventItem[] here. */
  getEvents(): Observable<EventItem[]> {
    return this.http
      .get<EventListResponse>(`${this.baseUrl}/list`)
      .pipe(map((res) => res?.data || []));
  }

  createEvent(payload: Partial<EventItem>): Observable<EventItem> {
    return this.http.post<EventItem>(`${this.baseUrl}`, payload);
  }

  // ---------------------------------------------------------
  // Categories
  // ---------------------------------------------------------

  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(`${this.baseUrl}/categories/list`);
  }

  getCategoryById(categoryId: number): Observable<EventCategory> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<EventCategory>(`${this.baseUrl}/category/categoryId`, { params });
  }

  // ---------------------------------------------------------
  // Sub-categories
  // ---------------------------------------------------------

  getSubCategories(): Observable<EventSubCategory[]> {
    return this.http.get<EventSubCategory[]>(`${this.baseUrl}/sub-categories/list`);
  }

  getSubCategoryById(id: number): Observable<EventSubCategory> {
    const params = new HttpParams().set('id', id);
    return this.http.get<EventSubCategory>(`${this.baseUrl}/sub-category/subCategoryId`, { params });
  }

  getSubCategoriesByCategoryId(eventCategoryId: number): Observable<EventSubCategory[]> {
    const params = new HttpParams().set('eventCategoryId', eventCategoryId);
    return this.http.get<EventSubCategory[]>(`${this.baseUrl}/sub-category/eventCategoryId`, { params });
  }

  // ---------------------------------------------------------
  // Venues
  // ---------------------------------------------------------

  getVenues(): Observable<EventVenue[]> {
    return this.http.get<EventVenue[]>(`${this.baseUrl}/venu-list`);
  }

  getVenueById(id: number): Observable<EventVenue> {
    const params = new HttpParams().set('id', id);
    return this.http.get<EventVenue>(`${this.baseUrl}/venu/venueId`, { params });
  }

  // ---------------------------------------------------------
  // Organizers
  // ---------------------------------------------------------

  getOrganizers(): Observable<EventOrganizer[]> {
    return this.http.get<EventOrganizer[]>(`${this.baseUrl}/organizer/list`);
  }

  getOrganizerById(id: number): Observable<EventOrganizer> {
    const params = new HttpParams().set('id', id);
    return this.http.get<EventOrganizer>(`${this.baseUrl}/organizer/organizerId`, { params });
  }
}
