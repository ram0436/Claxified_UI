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
export class FashionService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveFashionPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Fashion`, payLoad);
  }
  getAllFashionPosts() {
    return this.httpClient.get(`${this.BaseURL}Fashion`);
  }
  uploadFashionImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Fashion/UploadImages`, formData);
  }
  getFashionPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Fashion/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateFashionPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Fashion/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Fashion?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllFashionPosts() above is unchanged.
   */
  getPagedFashionPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Fashion`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
