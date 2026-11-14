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
export class CommercialService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveCommercialServicePost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}CommercialService`, payLoad);
  }
  getAllCommercialServicePosts() {
    return this.httpClient.get(`${this.BaseURL}CommercialService`);
  }
  uploadCommercialServiceImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}CommercialService/UploadImages`, formData);
  }
  getCommercialServicePostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}CommercialService/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateCommercialServicePost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}CommercialService/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET CommercialService?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllCommercialServicePosts() above is unchanged.
   */
  getPagedCommercialServicePosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}CommercialService`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
