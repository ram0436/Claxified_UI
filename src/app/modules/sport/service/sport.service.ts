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
export class SportService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveSportPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Sport`, payLoad);
  }
  getAllSportPosts() {
    return this.httpClient.get(`${this.BaseURL}Sport/GetAll`);
  }
  uploadSportImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Sport/UploadImages`, formData);
  }
  getSportPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Sport/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateSportPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Sport/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Sport?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllSportPosts() above is unchanged.
   */
  getPagedSportPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Sport`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
