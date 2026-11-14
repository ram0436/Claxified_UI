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
export class GadgetService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;

  uploadGadgetImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Gadget/UploadImages`, formData);
  }
  saveGadgetPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Gadget`, payLoad);
  }
  getAllGadgetPosts() {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetAll`);
  }
  getMobileBrands() {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetAllMobileBrand`);
  }
  getTabletBrands() {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetAllTabletBrand`);
  }
  getGadgetPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetGadgetByGuid?tabRefGuid=` + guid)
  }
  updateGadgetPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Gadget/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Gadget?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllGadgetPosts() above is unchanged.
   */
  getPagedGadgetPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Gadget`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
