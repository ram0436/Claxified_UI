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
export class BookService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveBookPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Book`, payLoad);
  }
  getAllBookPosts() {
    return this.httpClient.get(`${this.BaseURL}Book`);
  }
  uploadBookImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Book/UploadImages`, formData);
  }
  getBookPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Book/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateBookPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Book/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Book?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllBookPosts() above is unchanged.
   */
  getPagedBookPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Book`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
