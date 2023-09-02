import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
