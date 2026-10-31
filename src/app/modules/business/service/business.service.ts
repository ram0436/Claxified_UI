import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  forgetBusinessSlug,
  getCachedBusinessGuid,
  rememberBusinessGuids,
} from '../utils/business-url.util';
import { environment } from 'src/environments/environment';
import {
  BusinessDirectoryItem,
  BusinessListItem,
  BusinessViewDto,
  BusinessProduct,
  ProductCategoryDto,
  ProductSubCategoryDto,
  BusinessProductDto,
  BusinessOffer,
  BusinessOfferDto,
  BusinessReview,
  BusinessReviewDto,
  BusinessServicePayload,
  BusinessServiceDto,
  AttributeMasterDto,
  AttributeMasterIdDto,
  AttributeMasterListItem,
  CategoryAttributeMappingPayload,
  CategoryAttributeMappingDto,
  BusinessOfferingDto,
  OfferingTypeOptionDto,
  OfferingCombinedSavePayload,
  WishlistBusinessOffering,
  WishlistBusiness,
  SavedBusiness,
} from '../model/Business';
import { EntityType } from '../enum/business-product.enum';
import { OfferingType } from '../enum/business-offering.enum';
import {
  AnalyticsGranularity,
  BusinessAnalyticsEventType,
  BusinessOfferingAnalyticsEventType,
} from '../model/business-analytics';

const OFFERING_DETAIL_ENDPOINT: Partial<Record<number, string>> = {
  [OfferingType.Course]: 'offering-course',
  [OfferingType.MedicalService]: 'offering-medical-service',
  [OfferingType.MenuItem]: 'offering-menu-item',
  [OfferingType.RoomAccommodation]: 'offering-accommodation',
  [OfferingType.Property]: 'offering-property',
  [OfferingType.RentalVehicle]: 'offering-rental-vehicle',
  [OfferingType.Event]: 'offering-event',
  [OfferingType.TourPackage]: 'offering-tour-package',
  [OfferingType.MembershipPlan]: 'offering-membership-plan',
};

/** Query parameters accepted by the paginated Business/List endpoint. */
export interface BusinessListQuery {
  pageIndex: number;
  pageSize: number;
  businessCategoryId?: number | null;
  businessTypeId?: number | null;
  sellerTypeId?: number | null;
}

/** Normalized response shape for Business/List. */
export interface BusinessListResponse {
  items: BusinessDirectoryItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private baseUrl = environment.baseUrl;
  private dataSubject = new Subject<any>();

  private businessUpdatedSource = new Subject<{
    businessId: string;
    businessName: string;
    logoUrl: string;
  }>();

  businessUpdated$ = this.businessUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  // Overload 1: legacy no-args call → flat array (backwards compatible)
  getBusinessList(): Observable<BusinessDirectoryItem[]>;
  // Overload 2: paginated call → envelope
  getBusinessList(query: BusinessListQuery): Observable<BusinessListResponse>;
  // Implementation
  getBusinessList(
    query?: BusinessListQuery,
  ): Observable<BusinessDirectoryItem[] | BusinessListResponse> {
    if (!query) {
      return this.http
        .get<BusinessDirectoryItem[]>(`${this.baseUrl}Business/List`)
        .pipe(
          tap((list) =>
            rememberBusinessGuids((list || []).map((b) => b.tabRefGUID)),
          ),
        );
    }

    let params = new HttpParams()
      .set('pageIndex', String(query.pageIndex))
      .set('pageSize', String(query.pageSize));

    if (query.businessCategoryId != null) {
      params = params.set(
        'businessCategoryId',
        String(query.businessCategoryId),
      );
    }
    if (query.businessTypeId != null) {
      params = params.set('businessTypeId', String(query.businessTypeId));
    }
    if (query.sellerTypeId != null) {
      params = params.set('sellerTypeId', String(query.sellerTypeId));
    }

    return this.http
      .get<
        BusinessListResponse | BusinessDirectoryItem[]
      >(`${this.baseUrl}Business/List`, { params })
      .pipe(
        map((res): BusinessListResponse => {
          if (Array.isArray(res)) {
            return {
              items: res,
              totalCount: res.length,
              pageIndex: query.pageIndex,
              pageSize: query.pageSize,
            };
          }
          const anyRes = res as any;
          return {
            items: anyRes.items ?? anyRes.data ?? anyRes.results ?? [],
            totalCount:
              anyRes.totalCount ??
              anyRes.total ??
              anyRes.totalRecords ??
              anyRes.count ??
              0,
            pageIndex: anyRes.pageIndex ?? query.pageIndex,
            pageSize: anyRes.pageSize ?? query.pageSize,
          };
        }),
        tap((res) =>
          rememberBusinessGuids((res.items || []).map((b) => b.tabRefGUID)),
        ),
      );
  }

  getBusinessCategories() {
    return this.http.get(`${this.baseUrl}Business/business-categories`);
  }

  getBusinessSubCategories(businessCategoryId: number) {
    return this.http.get(
      `${this.baseUrl}Business/business-subcategories?businessCategoryId=${businessCategoryId}`,
    );
  }

  getProductCategories(): Observable<ProductCategoryDto[]> {
    return this.http.get<ProductCategoryDto[]>(
      `${this.baseUrl}Business/business-categories`,
    );
  }

  getProductSubCategories(
    productCategoryId: number,
  ): Observable<ProductSubCategoryDto[]> {
    return this.http.get<ProductSubCategoryDto[]>(
      `${this.baseUrl}Business/business-subcategories?businessCategoryId=${productCategoryId}`,
    );
  }

  getBusinessTypes() {
    return this.http.get(`${this.baseUrl}Business/business-types`);
  }

  getSellerTypes() {
    return this.http.get(`${this.baseUrl}Business/seller-types`);
  }

  getBusinessByGuid(tabRefGUID: string): Observable<BusinessViewDto> {
    return this.http.get<BusinessViewDto>(
      `${this.baseUrl}Business/${tabRefGUID}`,
    );
  }

  getBusinessBySlug(slug: string): Observable<BusinessViewDto> {
    const cached = getCachedBusinessGuid(slug);
    if (cached) {
      return this.getBusinessByGuid(cached).pipe(
        catchError(() => {
          forgetBusinessSlug(slug);
          return this.resolveSlugViaList(slug);
        }),
      );
    }
    return this.resolveSlugViaList(slug);
  }

  private resolveSlugViaList(slug: string): Observable<BusinessViewDto> {
    const prefix = (slug || '').toLowerCase() + '-';
    const matches = (guid?: string | null) =>
      !!guid && guid.toLowerCase().startsWith(prefix);

    const userId = Number(localStorage.getItem('id'));
    const publicGuids$ = this.getBusinessList({
      pageIndex: 1,
      pageSize: 1000,
    }).pipe(
      map((res) => (res.items || []).map((b) => b.tabRefGUID)),
      catchError(() => of([] as string[])),
    );
    const ownGuids$ = userId
      ? this.getUserBusinesses(userId).pipe(
          map((list) => (list || []).map((b) => b.businessId)),
          catchError(() => of([] as string[])),
        )
      : of([] as string[]);

    return forkJoin([publicGuids$, ownGuids$]).pipe(
      map(([pub, own]) => {
        const all = [...pub, ...own].filter(Boolean);
        rememberBusinessGuids(all);
        return all.find((g) => matches(g)) ?? null;
      }),
      switchMap((guid) =>
        guid
          ? this.getBusinessByGuid(guid)
          : throwError(() => new Error('Business not found')),
      ),
    );
  }

  getUserBusinesses(userId: number): Observable<BusinessListItem[]> {
    return this.http.get<BusinessListItem[]>(
      `${this.baseUrl}Business/businesses?userId=${userId}`,
    );
  }

  uploadLogo(formData: FormData): Observable<string> {
    return this.http.post(`${this.baseUrl}Business/UploadLogo`, formData, {
      responseType: 'text',
    }) as Observable<string>;
  }

  uploadCoverImage(formData: FormData): Observable<string> {
    return this.http.post(
      `${this.baseUrl}Business/UploadCoverImage`,
      formData,
      { responseType: 'text' },
    ) as Observable<string>;
  }

  uploadGalleryImages(formData: any) {
    return this.http.post(
      `${this.baseUrl}Business/UploadGalleryImages`,
      formData,
    );
  }

  uploadProductImages(formData: FormData): Observable<string[]> {
    return this.http.post<string[]>(
      `${this.baseUrl}Business/UploadProductImages`,
      formData,
    );
  }

  saveBusiness(payload: any) {
    return this.http.post(`${this.baseUrl}Business/Register`, payload);
  }

  updateBusiness(payload: any) {
    return this.http.put(`${this.baseUrl}Business/Edit`, payload);
  }

  deleteBusiness(id: number) {
    return this.http.delete(`${this.baseUrl}Business/${id}`);
  }

  // ---------- Products ----------

  getBusinessProducts(businessId: number): Observable<BusinessProductDto[]> {
    return this.http.get<BusinessProductDto[]>(
      `${this.baseUrl}Business/products?businessId=${businessId}`,
    );
  }

  saveProduct(payload: BusinessProduct) {
    return this.http.post(`${this.baseUrl}Business/Product`, payload);
  }

  notifyBusinessUpdated(
    businessId: string,
    businessName: string,
    logoUrl: string,
  ): void {
    this.businessUpdatedSource.next({ businessId, businessName, logoUrl });
  }

  getBusinessProductDetails(productId: number): Observable<BusinessProductDto> {
    return this.http
      .get<BusinessProductDto[]>(`${this.baseUrl}Business/product/${productId}`)
      .pipe(map((res) => res[0]));
  }

  // ---------- Offers ----------

  getBusinessOffers(businessId: number): Observable<BusinessOfferDto[]> {
    return this.http.get<BusinessOfferDto[]>(
      `${this.baseUrl}Business/offers?businessId=${businessId}`,
    );
  }

  saveOffer(payload: BusinessOffer) {
    return this.http.post(`${this.baseUrl}Business/offer`, payload);
  }

  // ---------- Reviews ----------

  getBusinessReviews(businessId: number): Observable<BusinessReviewDto[]> {
    return this.http.get<BusinessReviewDto[]>(
      `${this.baseUrl}Business/reviews?businessId=${businessId}`,
    );
  }

  saveReview(payload: BusinessReview) {
    return this.http.post(`${this.baseUrl}Business/review`, payload);
  }

  // ---------- Services ----------

  getBusinessServices(businessId: number): Observable<BusinessServiceDto[]> {
    return this.http.get<BusinessServiceDto[]>(
      `${this.baseUrl}Business/services?businessId=${businessId}`,
    );
  }

  getBusinessServiceDetails(serviceId: number): Observable<BusinessServiceDto> {
    return this.http
      .get<
        BusinessServiceDto[]
      >(`${this.baseUrl}Business/services/${serviceId}`)
      .pipe(map((res) => res[0]));
  }

  saveService(payload: BusinessServicePayload) {
    return this.http.post(`${this.baseUrl}Business/service`, payload);
  }

  uploadServiceImages(formData: FormData): Observable<string[]> {
    return this.http.post<string[]>(
      `${this.baseUrl}Business/UploadServiceImages`,
      formData,
    );
  }

  // ---------- Attribute resolution (internal, silent) ----------

  getAttributeMasterIds(
    businessSubCategoryId: number,
    entityType: EntityType,
  ): Observable<AttributeMasterIdDto[]> {
    return this.http
      .get<
        AttributeMasterIdDto[]
      >(`${this.baseUrl}Business/attribute-masterids?businessSubCategoryId=${businessSubCategoryId}`)
      .pipe(
        map((res) =>
          (res || []).filter((a) => a.entityType === entityType && a.isActive),
        ),
      );
  }

  getAttributeDetails(
    attributeMasterIds: number[],
  ): Observable<AttributeMasterDto[]> {
    let params = new HttpParams();
    attributeMasterIds.forEach((id) => {
      params = params.append('attributeMasterIds', id.toString());
    });

    return this.http.get<AttributeMasterDto[]>(
      `${this.baseUrl}Business/attributes-detail`,
      { params },
    );
  }

  // ---------- Admin: Attribute Master ----------

  getAttributeMasterList(): Observable<AttributeMasterListItem[]> {
    return this.http.get<AttributeMasterListItem[]>(
      `${this.baseUrl}Business/attribute-master`,
    );
  }

  saveCategoryAttributeMapping(
    payload: CategoryAttributeMappingPayload,
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}Business/category-attribute-mapping`,
      payload,
    );
  }

  getCategoryAttributeMapping(
    subCategoryId: number,
    entityType: EntityType,
  ): Observable<CategoryAttributeMappingDto> {
    return this.http.get<CategoryAttributeMappingDto>(
      `${this.baseUrl}Business/category-attribute-mapping?subCategoryId=${subCategoryId}&entityType=${entityType}`,
    );
  }

  // ---------- Business Offerings ----------

  getBusinessOfferingsByBusinessId(
    businessId: number,
    subCategoryId?: number | null,
    offeringType?: OfferingType | number | null,
  ): Observable<BusinessOfferingDto[]> {
    let params = new HttpParams().set('businessId', businessId.toString());

    if (subCategoryId !== null && subCategoryId !== undefined) {
      params = params.set('subCategoryId', subCategoryId.toString());
    }

    if (offeringType !== null && offeringType !== undefined) {
      params = params.set('offeringType', offeringType.toString());
    }

    return this.http
      .get<
        BusinessOfferingDto | BusinessOfferingDto[]
      >(`${this.baseUrl}Business/business-offering`, { params })
      .pipe(
        map((res) => (Array.isArray(res) ? res : res ? [res] : [])),
        catchError((err: HttpErrorResponse) =>
          err.status === 404 ? of([]) : throwError(() => err),
        ),
      );
  }

  getBusinessOfferingById(id: number): Observable<BusinessOfferingDto> {
    return this.http.get<BusinessOfferingDto>(
      `${this.baseUrl}Business/business-offering?id=${id}`,
    );
  }

  getOfferingTypesByBusinessCategory(
    businessCategoryId: number,
  ): Observable<OfferingTypeOptionDto[]> {
    return this.http.get<OfferingTypeOptionDto[]>(
      `${this.baseUrl}Business/offeringType?businessCategoryId=${businessCategoryId}`,
    );
  }

  // ---------- Offering detail (all types) ----------

  getOfferingDetail(
    type: OfferingType | number,
    businessOfferingId: number,
  ): Observable<any> {
    const endpoint = OFFERING_DETAIL_ENDPOINT[Number(type)];
    if (!endpoint) return of(null);
    return this.http.get<any>(
      `${this.baseUrl}Business/${endpoint}/id?businessOfferingId=${businessOfferingId}`,
    );
  }

  saveOfferingDetail(
    type: OfferingType | number,
    payload: OfferingCombinedSavePayload,
  ): Observable<any> {
    const endpoint = OFFERING_DETAIL_ENDPOINT[Number(type)];
    if (!endpoint) {
      return throwError(() => new Error('Unsupported offering type'));
    }
    return this.http.post<any>(`${this.baseUrl}Business/${endpoint}`, payload);
  }

  // ---------- Saved Business ----------

  getSavedBusinesses(userId: number): Observable<SavedBusiness[]> {
    return this.http.get<SavedBusiness[]>(
      `${this.baseUrl}Business/saved-businesses/${userId}`,
    );
  }

  isBusinessSaved(userId: number, businessId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}Business/saved-business/${userId}/${businessId}/exists`,
    );
  }

  saveBusinessForUser(userId: number, businessId: number) {
    const body = new SavedBusiness();
    body.userId = userId;
    body.businessId = businessId;
    body.createdBy = userId;
    body.modifiedBy = userId;
    body.isDeleted = false;
    return this.http.post(`${this.baseUrl}Business/saved-business`, body);
  }

  unsaveBusiness(userId: number, businessId: number) {
    return this.http.delete(
      `${this.baseUrl}Business/saved-business/${userId}/${businessId}`,
    );
  }

  // ---------- Wishlist Business ----------

  getWishlistBusinesses(userId: number): Observable<WishlistBusiness[]> {
    return this.http.get<WishlistBusiness[]>(
      `${this.baseUrl}Business/wishlist-businesses/${userId}`,
    );
  }

  isBusinessWishlisted(
    userId: number,
    businessId: number,
  ): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}Business/wishlist-business/${userId}/${businessId}/exists`,
    );
  }

  addBusinessToWishlist(userId: number, businessId: number) {
    const body = new WishlistBusiness();
    body.userId = userId;
    body.businessId = businessId;
    body.createdBy = userId;
    body.modifiedBy = userId;
    body.isDeleted = false;
    return this.http.post(`${this.baseUrl}Business/wishlist-business`, body);
  }

  removeBusinessFromWishlist(userId: number, businessId: number) {
    return this.http.delete(
      `${this.baseUrl}Business/wishlist-business/${userId}/${businessId}`,
    );
  }

  // ---------- Wishlist Business Offering ----------

  getWishlistOfferings(userId: number): Observable<WishlistBusinessOffering[]> {
    return this.http.get<WishlistBusinessOffering[]>(
      `${this.baseUrl}Business/wishlist-business-offerings/${userId}`,
    );
  }

  isOfferingWishlisted(
    userId: number,
    businessOfferingId: number,
  ): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}Business/wishlist-business-offering/${userId}/${businessOfferingId}/exists`,
    );
  }

  addOfferingToWishlist(userId: number, businessOfferingId: number) {
    const body = new WishlistBusinessOffering();
    body.userId = userId;
    body.businessOfferingId = businessOfferingId;
    body.createdBy = userId;
    body.modifiedBy = userId;
    body.isDeleted = false;
    return this.http.post(
      `${this.baseUrl}Business/wishlist-business-offering`,
      body,
    );
  }

  removeOfferingFromWishlist(userId: number, businessOfferingId: number) {
    return this.http.delete(
      `${this.baseUrl}Business/wishlist-business-offering/${userId}/${businessOfferingId}`,
    );
  }

  private range(from: Date, to: Date): HttpParams {
    return new HttpParams()
      .set('fromDate', from.toISOString())
      .set('toDate', to.toISOString());
  }

  trackBusinessEvent(
    businessId: number,
    eventType: BusinessAnalyticsEventType,
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}Business/analytics/${businessId}/track`,
      { eventType },
    );
  }

  trackOfferingEvent(
    businessId: number,
    offeringId: number,
    eventType: BusinessOfferingAnalyticsEventType,
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}Business/analytics/business/${businessId}/offering/${offeringId}/track`,
      { eventType },
    );
  }

  getBusinessSummary(
    businessId: number,
    from: Date,
    to: Date,
  ): Observable<any> {
    return this.http.get(`${this.baseUrl}Business/analytics/${businessId}`, {
      params: this.range(from, to),
    });
  }

  getBusinessSeries(
    businessId: number,
    granularity: AnalyticsGranularity,
    from: Date,
    to: Date,
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}Business/analytics/${businessId}/${granularity}`,
      {
        params: this.range(from, to),
      },
    );
  }

  getOfferingSeries(
    businessId: number,
    offeringId: number,
    granularity: AnalyticsGranularity,
    from: Date,
    to: Date,
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}Business/analytics/business/${businessId}/offering/${offeringId}/${granularity}`,
      { params: this.range(from, to) },
    );
  }
}
