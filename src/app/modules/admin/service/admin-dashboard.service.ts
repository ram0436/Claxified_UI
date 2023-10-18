import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  

  constructor(private httpClient: HttpClient) { }
  private BaseURL = environment.baseUrl;

  getAllCategory(){
    return this.httpClient.get(`${this.BaseURL}Common/GetAllCategory`);
  }

  getAdsByCategory(categoryId : number){
    return this.httpClient.get(`${this.BaseURL}Dashboard/GetAdsByCategory?categoryId=${categoryId}`);
  }

  verifyAd(categoryId: number, tableRefGuid: string) {
    return this.httpClient.post(`${this.BaseURL}Dashboard/verifyAd?categoryId=${categoryId}&tabRefGuid=${tableRefGuid}`, null);
  }
  
  

}
