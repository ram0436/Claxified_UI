import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
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
} from "../model/Business";
import { EntityType } from "../enum/business-product.enum";

@Injectable({
  providedIn: "root",
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
    return this.http.get<BusinessDirectoryItem[]>(
      `${this.baseUrl}Business/List`
    );
  }

  getBusinessCategories() {
    return this.http.get(`${this.baseUrl}Business/business-categories`);
  }

  getBusinessSubCategories(businessCategoryId: number) {
    return this.http.get(
      `${this.baseUrl}Business/business-subcategories?businessCategoryId=${businessCategoryId}`
    );
  }

  getProductCategories(): Observable<ProductCategoryDto[]> {
    return this.http.get<ProductCategoryDto[]>(
      `${this.baseUrl}Business/business-categories`
    );
  }

  getProductSubCategories(
    productCategoryId: number
  ): Observable<ProductSubCategoryDto[]> {
    return this.http.get<ProductSubCategoryDto[]>(
      `${this.baseUrl}Business/business-subcategories?businessCategoryId=${productCategoryId}`
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
      `${this.baseUrl}Business/${tabRefGUID}`
    );
  }

  getUserBusinesses(userId: number): Observable<BusinessListItem[]> {
    return this.http.get<BusinessListItem[]>(
      `${this.baseUrl}Business/businesses?userId=${userId}`
    );
  }

  uploadLogo(formData: FormData): Observable<string> {
    return this.http.post(`${this.baseUrl}Business/UploadLogo`, formData, {
      responseType: "text",
    }) as Observable<string>;
  }

  uploadCoverImage(formData: FormData): Observable<string> {
    return this.http.post(
      `${this.baseUrl}Business/UploadCoverImage`,
      formData,
      {
        responseType: "text",
      }
    ) as Observable<string>;
  }

  uploadGalleryImages(formData: any) {
    return this.http.post(
      `${this.baseUrl}Business/UploadGalleryImages`,
      formData
    );
  }

  uploadProductImages(formData: FormData): Observable<string[]> {
    return this.http.post<string[]>(
      `${this.baseUrl}Business/UploadProductImages`,
      formData
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
      `${this.baseUrl}Business/products?businessId=${businessId}`
    );
  }

  saveProduct(payload: BusinessProduct) {
    return this.http.post(`${this.baseUrl}Business/Product`, payload);
  }

  notifyBusinessUpdated(
    businessId: string,
    businessName: string,
    logoUrl: string
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
      `${this.baseUrl}Business/offers?businessId=${businessId}`
    );
  }

  saveOffer(payload: BusinessOffer) {
    return this.http.post(`${this.baseUrl}Business/offer`, payload);
  }

  // ---------- Reviews ----------

  getBusinessReviews(businessId: number): Observable<BusinessReviewDto[]> {
    return this.http.get<BusinessReviewDto[]>(
      `${this.baseUrl}Business/reviews?businessId=${businessId}`
    );
  }

  saveReview(payload: BusinessReview) {
    return this.http.post(`${this.baseUrl}Business/review`, payload);
  }

  // ---------- Services ----------

  getBusinessServices(businessId: number): Observable<BusinessServiceDto[]> {
    return this.http.get<BusinessServiceDto[]>(
      `${this.baseUrl}Business/services?businessId=${businessId}`
    );
  }

  getBusinessServiceDetails(serviceId: number): Observable<BusinessServiceDto> {
    return this.http
      .get<BusinessServiceDto[]>(
        `${this.baseUrl}Business/services/${serviceId}`
      )
      .pipe(map((res) => res[0]));
  }

  saveService(payload: BusinessServicePayload) {
    return this.http.post(`${this.baseUrl}Business/service`, payload);
  }

  uploadServiceImages(formData: FormData): Observable<string[]> {
    return this.http.post<string[]>(
      `${this.baseUrl}Business/UploadServiceImages`,
      formData
    );
  }

  // ---------- Attribute resolution (internal, silent) ----------

  getAttributeMasterIds(
    businessSubCategoryId: number,
    entityType: EntityType
  ): Observable<AttributeMasterIdDto[]> {
    return this.http
      .get<AttributeMasterIdDto[]>(
        `${this.baseUrl}Business/attribute-masterids?businessSubCategoryId=${businessSubCategoryId}`
      )
      .pipe(
        map((res) =>
          (res || []).filter((a) => a.entityType === entityType && a.isActive)
        )
      );
  }

  getAttributeDetails(
    attributeMasterIds: number[]
  ): Observable<AttributeMasterDto[]> {
    let params = new HttpParams();
    attributeMasterIds.forEach((id) => {
      params = params.append("attributeMasterIds", id.toString());
    });

    return this.http.get<AttributeMasterDto[]>(
      `${this.baseUrl}Business/attributes-detail`,
      { params }
    );
  }

  // ---------- Admin: Attribute Master ----------

  getAttributeMasterList(): Observable<AttributeMasterListItem[]> {
    return this.http.get<AttributeMasterListItem[]>(
      `${this.baseUrl}Business/attribute-master`
    );
  }

  saveCategoryAttributeMapping(
    payload: CategoryAttributeMappingPayload
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}Business/category-attribute-mapping`,
      payload
    );
  }

  getCategoryAttributeMapping(
    subCategoryId: number,
    entityType: EntityType
  ): Observable<CategoryAttributeMappingDto> {
    return this.http.get<CategoryAttributeMappingDto>(
      `${this.baseUrl}Business/category-attribute-mapping?subCategoryId=${subCategoryId}&entityType=${entityType}`
    );
  }
}
