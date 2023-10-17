import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
