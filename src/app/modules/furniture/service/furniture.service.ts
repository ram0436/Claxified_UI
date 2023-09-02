import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
