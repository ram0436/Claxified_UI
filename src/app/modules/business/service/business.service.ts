import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  OfferingMedicalServiceDto,
  BusinessOfferingDto,
  OfferingCourseDto,
  OfferingTypeOptionDto,
  OfferingMembershipPlanDto,
  OfferingTourPackageDto,
  OfferingEventDto,
  OfferingRentalVehicleDto,
  OfferingPropertyDto,
  OfferingAccommodationDto,
  OfferingMenuItemDto,
  OfferingMedicalServiceSavePayload,
  OfferingCombinedSavePayload,
} from '../model/Business';
import { EntityType } from '../enum/business-product.enum';
import { OfferingType } from '../enum/business-offering.enum';
import { HttpErrorResponse } from '@angular/common/http';

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

  getBusinessList(): Observable<BusinessDirectoryItem[]> {
    return this.http
      .get<BusinessDirectoryItem[]>(`${this.baseUrl}Business/List`)
      .pipe(
        tap((list) =>
          rememberBusinessGuids((list || []).map((b) => b.tabRefGUID)),
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
    const publicGuids$ = this.getBusinessList().pipe(
      map((list) => (list || []).map((b) => b.tabRefGUID)),
      catchError(() => of([] as string[])),
    );
    const ownGuids$ = userId
      ? this.getUserBusinesses(userId).pipe(
          map((list) => (list || []).map((b) => b.businessId)),
          catchError(() => of([] as string[])),
        )
      : of([] as string[]);

    // both calls run in parallel
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
      {
        responseType: 'text',
      },
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

  saveBusinessOffering(
    payload: BusinessOfferingDto,
  ): Observable<BusinessOfferingDto> {
    return this.http.post<BusinessOfferingDto>(
      `${this.baseUrl}Business/business-offering`,
      payload,
    );
  }

  // ---------- Offering detail: Course ----------

  getOfferingCourse(businessOfferingId: number): Observable<OfferingCourseDto> {
    return this.http.get<OfferingCourseDto>(
      `${this.baseUrl}Business/offering-course/id?businessOfferingId=${businessOfferingId}`,
    );
  }

  saveOfferingCourse(
    payload: OfferingCourseDto,
  ): Observable<OfferingCourseDto> {
    return this.http.post<OfferingCourseDto>(
      `${this.baseUrl}Business/offering-course`,
      payload,
    );
  }

  // ---------- Offering detail: Medical Service ----------

  getOfferingMedicalService(
    businessOfferingId: number,
  ): Observable<OfferingMedicalServiceDto> {
    return this.http.get<OfferingMedicalServiceDto>(
      `${this.baseUrl}Business/offering-medical-service/id?businessOfferingId=${businessOfferingId}`,
    );
  }

  saveOfferingMedicalService(
    payload: OfferingCombinedSavePayload,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-medical-service`,
      payload,
    );
  }

  getOfferingTypesByBusinessCategory(
    businessCategoryId: number,
  ): Observable<OfferingTypeOptionDto[]> {
    return this.http.get<OfferingTypeOptionDto[]>(
      `${this.baseUrl}Business/offeringType?businessCategoryId=${businessCategoryId}`,
    );
  }

  // ---------- Offering detail: Menu Item ----------
  getOfferingMenuItem(
    businessOfferingId: number,
  ): Observable<OfferingMenuItemDto> {
    return this.http.get<OfferingMenuItemDto>(
      `${this.baseUrl}Business/offering-menu-item/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingMenuItem(payload: OfferingCombinedSavePayload): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-menu-item`,
      payload,
    );
  }

  // ---------- Offering detail: Room / Accommodation ----------
  getOfferingAccommodation(
    businessOfferingId: number,
  ): Observable<OfferingAccommodationDto> {
    return this.http.get<OfferingAccommodationDto>(
      `${this.baseUrl}Business/offering-accommodation/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingAccommodation(
    payload: OfferingCombinedSavePayload,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-accommodation`,
      payload,
    );
  }

  // ---------- Offering detail: Property ----------
  getOfferingProperty(
    businessOfferingId: number,
  ): Observable<OfferingPropertyDto> {
    return this.http.get<OfferingPropertyDto>(
      `${this.baseUrl}Business/offering-property/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingProperty(payload: OfferingCombinedSavePayload): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-property`,
      payload,
    );
  }

  // ---------- Offering detail: Rental Vehicle ----------
  getOfferingRentalVehicle(
    businessOfferingId: number,
  ): Observable<OfferingRentalVehicleDto> {
    return this.http.get<OfferingRentalVehicleDto>(
      `${this.baseUrl}Business/offering-rental-vehicle/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingRentalVehicle(
    payload: OfferingCombinedSavePayload,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-rental-vehicle`,
      payload,
    );
  }

  // ---------- Offering detail: Event ----------
  getOfferingEvent(businessOfferingId: number): Observable<OfferingEventDto> {
    return this.http.get<OfferingEventDto>(
      `${this.baseUrl}Business/offering-event/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingEvent(payload: OfferingCombinedSavePayload): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-event`,
      payload,
    );
  }

  // ---------- Offering detail: Tour Package ----------
  getOfferingTourPackage(
    businessOfferingId: number,
  ): Observable<OfferingTourPackageDto> {
    return this.http.get<OfferingTourPackageDto>(
      `${this.baseUrl}Business/offering-tour-package/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingTourPackage(
    payload: OfferingCombinedSavePayload,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-tour-package`,
      payload,
    );
  }

  // ---------- Offering detail: Membership Plan ----------
  getOfferingMembershipPlan(
    businessOfferingId: number,
  ): Observable<OfferingMembershipPlanDto> {
    return this.http.get<OfferingMembershipPlanDto>(
      `${this.baseUrl}Business/offering-membership-plan/id?businessOfferingId=${businessOfferingId}`,
    );
  }
  saveOfferingMembershipPlan(
    payload: OfferingCombinedSavePayload,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Business/offering-membership-plan`,
      payload,
    );
  }

  getOfferingDetail(
    type: OfferingType | number,
    businessOfferingId: number,
  ): Observable<any> {
    switch (Number(type)) {
      case Number(OfferingType.Course):
        return this.getOfferingCourse(businessOfferingId);
      case Number(OfferingType.MedicalService):
        return this.getOfferingMedicalService(businessOfferingId);
      case Number(OfferingType.MenuItem):
        return this.getOfferingMenuItem(businessOfferingId);
      case Number(OfferingType.RoomAccommodation):
        return this.getOfferingAccommodation(businessOfferingId);
      case Number(OfferingType.Property):
        return this.getOfferingProperty(businessOfferingId);
      case Number(OfferingType.RentalVehicle):
        return this.getOfferingRentalVehicle(businessOfferingId);
      case Number(OfferingType.Event):
        return this.getOfferingEvent(businessOfferingId);
      case Number(OfferingType.TourPackage):
        return this.getOfferingTourPackage(businessOfferingId);
      case Number(OfferingType.MembershipPlan):
        return this.getOfferingMembershipPlan(businessOfferingId);
      default:
        return of(null);
    }
  }
}
