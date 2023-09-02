import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplianceService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveElectronicAppliancePost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}ElectricAppliance`, payLoad);
  }
  getAllElectronicAppliancePosts() {
    return this.httpClient.get(`${this.BaseURL}ElectricAppliance`);
  }
  uploadElectronicApplianceImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}ElectricAppliance/UploadImages`, formData);
  }
  getElectronicAppliancePostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}ElectricAppliance/GetByTabRefGuid?tabRefGuid=` + guid)
  }
}
