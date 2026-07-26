import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class BusinessService {
  private baseUrl = environment.baseUrl;
  private dataSubject = new Subject<any>();

  constructor(private http: HttpClient) {}

  getBusinessCategories() {
    return this.http.get(`${this.baseUrl}Business/business-categories`);
  }

  getBusinessSubCategories(businessCategoryId: number) {
    return this.http.get(
      `${this.baseUrl}Business/business-subcategories?businessCategoryId=${businessCategoryId}`
    );
  }

  getBusinessTypes() {
    return this.http.get(`${this.baseUrl}Business/business-types`);
  }

  getSellerTypes() {
    return this.http.get(`${this.baseUrl}Business/seller-types`);
  }

  getBusinessByGuid(tabRefGUID: string) {
    return this.http.get(`${this.baseUrl}Business/${tabRefGUID}`);
  }

  uploadLogo(formData: any) {
    return this.http.post(`${this.baseUrl}Business/UploadLogo`, formData);
  }

  uploadCoverImage(formData: any) {
    return this.http.post(`${this.baseUrl}Business/UploadCoverImage`, formData);
  }

  uploadGalleryImages(formData: any) {
    return this.http.post(
      `${this.baseUrl}Business/UploadGalleryImages`,
      formData
    );
  }

  saveBusiness(payload: any) {
    return this.http.post(`${this.baseUrl}Business`, payload);
  }

  deleteBusiness(id: number) {
    return this.http.delete(`${this.baseUrl}Business/${id}`);
  }
}
