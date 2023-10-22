import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
