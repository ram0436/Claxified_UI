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
export class PropertyService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;

  getAllPropertyPosts() {
    return this.httpClient.get(`${this.BaseURL}Property`);
  }
  savePropertyPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Property`, payLoad);
  }
  getPropertyPostById(id: any) {
    return this.httpClient.get(`${this.BaseURL}Property/GetPropertyByGuid?tabRefGuid=` + id);
  }
  uploadPropertyImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Property/UploadImages`, formData);
  }
  updatePropertyPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Property/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Property?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllPropertyPosts() above is unchanged.
   */
  getPagedPropertyPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Property`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
