import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GadgetService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;

  uploadGadgetImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Gadget/UploadImages`, formData);
  }
  saveGadgetPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Gadget`, payLoad);
  }
  getAllGadgetPosts() {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetAll`);
  }
  getMobileBrands() {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetAllMobileBrand`);
  }
  getTabletBrands() {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetAllTabletBrand`);
  }
  getGadgetPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Gadget/GetGadgetByGuid?tabRefGuid=` + guid)
  }
}
