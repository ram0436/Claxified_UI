import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  addDashboardMessage(requestBody: any) {
    return this.httpClient.post(`${this.BaseURL}Dashboard/AddDashboardMessage`, requestBody);
  }

  getDashboardMessage(): Observable<any[]> {
    const apiUrl = `${this.BaseURL}Dashboard/GetDashboardMessage`;
    return this.httpClient.get<any[]>(apiUrl);
  }
  

}
