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
export class ApplianceService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveElectronicAppliancePost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}ElectricAppliance`, payLoad);
  }
  getAllElectronicAppliancePosts() {
    return this.httpClient.get(`${this.BaseURL}ElectricAppliance`);
  }
  uploadElectronicApplianceImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}ElectricAppliance/UploadImages`, formData);
  }
  getElectronicAppliancePostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}ElectricAppliance/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateElectronicAppliancePost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}ElectricAppliance/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET ElectricAppliance?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllElectronicAppliancePosts() above is unchanged.
   */
  getPagedElectronicAppliancePosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}ElectricAppliance`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
