import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
