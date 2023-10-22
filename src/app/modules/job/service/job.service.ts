import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;
  
  saveJobPost(payLoad: any) {
    return this.httpClient.post(`${this.BaseURL}Job`, payLoad);
  }
  getAllJobPosts() {
    return this.httpClient.get(`${this.BaseURL}Job`);
  }
  uploadJobImages(formData: any) {
    return this.httpClient.post(`${this.BaseURL}Job/UploadImages`, formData);
  }
  getJobPostByGuid(guid: any) {
    return this.httpClient.get(`${this.BaseURL}Job/GetByTabRefGuid?tabRefGuid=` + guid)
  }
  updateJobPost(payLoad: any) {
    return this.httpClient.put(`${this.BaseURL}Job/`+payLoad.id, payLoad);
  }
}
