import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import {
  buildPostsPageParams,
  normalizePagedPosts,
  PagedPosts,
  PostsPageQuery,
} from 'src/app/shared/model/PagedPosts';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;

  getAllVehiclePosts() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetAll`);
  }

  getCarBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetCarBrand`);
  }
  getBikeBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetBikeBrand`);
  }
  getScootyBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetScootyBrand`);
  }
  getBicycleBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetBicycleBrand`);
  }
  saveVehiclePost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Vehicle`, payLoad);
  }

  getVehiclePostById(id: any) {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetVehicleByTabRefGuid?tabRefGuid=` + id);
  }

  uploadVehicleImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Vehicle/UploadImages`, formData);
  }

  getCarModels(brandId : Number){
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetCarModel?carBrandId=` + brandId);
  }
  updateVehiclePost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Vehicle/`+payLoad.id, payLoad);
  }
  getBikeModels(brandId : Number){
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetBikeModel?bikeBrandId=` + brandId);
  }

  /**
   * Server-side paged list: GET Vehicle?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllVehiclePosts() above is unchanged.
   */
  getPagedVehiclePosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Vehicle`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
