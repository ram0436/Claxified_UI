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
export class JobService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveJobPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Job`, payLoad);
  }
  getAllJobPosts() {
    return this.httpClient.get(`${this.BaseURL}Job`);
  }
  uploadJobImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Job/UploadImages`, formData);
  }
  getJobPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Job/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateJobPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Job/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Job?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllJobPosts() above is unchanged.
   */
  getPagedJobPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Job`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
