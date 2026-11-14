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
export class FurnitureService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveFurniturePost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Furniture`, payLoad);
  }
  getAllFurniturePosts() {
    return this.httpClient.get(`${this.BaseURL}Furniture/GetAll`);
  }
  uploadFurnitureImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Furniture/UploadImages`, formData);
  }
  getFurniturePostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Furniture/GetByTabRefGuid?tabletabRefGuid=` + guid)
  }
  updateFurniturePost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Furniture/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Furniture?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllFurniturePosts() above is unchanged.
   */
  getPagedFurniturePosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Furniture`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
