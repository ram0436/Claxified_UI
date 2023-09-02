import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;

  getAllVehiclePosts() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetAll`);
  }

  getCarBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetCarBrand`);
  }
  getBikeBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetBikeBrand`);
  }
  getScootyBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetScootyBrand`);
  }
  getBicycleBrands() {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetBicycleBrand`);
  }
  saveVehiclePost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Vehicle`, payLoad);
  }

  getVehiclePostById(id: any) {
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetVehicleByTabRefGuid?tabRefGuid=` + id);
  }

  uploadVehicleImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Vehicle/UploadImages`, formData);
  }

  getCarModels(brandId : Number){
    return this.httpClient.get(`${this.BaseURL}Vehicle/GetCarModel?carBrandId=` + brandId);
  }
}
