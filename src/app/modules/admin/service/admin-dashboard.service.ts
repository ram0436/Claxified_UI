import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  
  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  private getAllItemsSubject = new BehaviorSubject<any[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();
  public getAllItems$ = this.getAllItemsSubject.asObservable();

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

  // searchAds(searchItem: string, city: string): Observable<any[]> {
  //   const apiUrl = `${this.BaseURL}Dashboard/GlobalSearch?searchItem=${searchItem}&city=${city}`;
  //   return this.httpClient.get<any[]>(apiUrl);
  // }
  
  searchAds(searchQuery: string, locationSearchQuery: string): Observable<any[]> {
    const apiUrl = `${this.BaseURL}Dashboard/GlobalSearch?searchItem=${searchQuery}&city=${locationSearchQuery}`;
    return this.httpClient.get<any[]>(apiUrl).pipe(
      tap((results) => {
        this.searchResultsSubject.next(results);
      })
    );
  }

  getAllItems(): Observable<any[]>{
    return this.httpClient.get<any[]>(`${this.BaseURL}Dashboard/GetAll?pageIndex=1&pageSize=30`).pipe(
      tap((results) => {
        this.getAllItemsSubject.next(results);
      })
    );
  }

}
