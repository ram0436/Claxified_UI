import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
