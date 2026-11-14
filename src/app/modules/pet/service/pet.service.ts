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
export class PetService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  savePetPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Pet`, payLoad);
  }
  getAllPetPosts() {
    return this.httpClient.get(`${this.BaseURL}Pet/GetAll`);
  }
  uploadPetImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Pet/UploadImages`, formData);
  }
  getPetPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Pet/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updatePetPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Pet/`+payLoad.id, payLoad);
  }

  /**
   * Server-side paged list: GET Pet?pageIndex=1&pageSize=10&subCategoryId=50
   * (subCategoryId only sent when a sub-category is selected). The legacy
   * getAllPetPosts() above is unchanged.
   */
  getPagedPetPosts(query: PostsPageQuery): Observable<PagedPosts> {
    return this.httpClient
      .get<any>(`${this.BaseURL}Pet`, {
        params: buildPostsPageParams(query),
      })
      .pipe(map((res) => normalizePagedPosts(res, query)));
  }
}
