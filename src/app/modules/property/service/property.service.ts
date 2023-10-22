import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
