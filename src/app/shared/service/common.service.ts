import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private dataSubject = new Subject<any>();
  private postDetailsSubject = new BehaviorSubject<any>(null);
  
  constructor(private httpClient : HttpClient) { }
  private BaseURL = environment.baseUrl;

  getAllItems(){
    return this.httpClient.get(`${this.BaseURL}Dashboard/GetAll?pageIndex=1&pageSize=30`);
  }
  getAddress(pinCode:any){
    return this.httpClient.get('https://api.postalpincode.in/pincode/'+pinCode);
  }
  getCountry(){
    return this.httpClient.get(`${this.BaseURL}Common/GetCountry`);
  }
  getStatesByCountry(countryId:Number){
    return this.httpClient.get(`${this.BaseURL}Common/GetAllState?countryId=`+countryId);
  }
  getCitiesByState(stateId:Number){
    return this.httpClient.get(`${this.BaseURL}Common/GetAllCity?stateId=`+stateId);
  }
  getNearPlacesByCity(cityId:Number){
    return this.httpClient.get(`${this.BaseURL}Common/GetAllNearBy?cityId=`+cityId);
  }
  getAllCategory(){
    return this.httpClient.get(`${this.BaseURL}Common/GetAllCategory`);
  }
  getSubCategoryByCategoryId(categoryId:Number){
    return this.httpClient.get(`${this.BaseURL}Common/GetSubCategory?categoryId=`+categoryId);
  }
  setData(data: any) {
    this.dataSubject.next(data);
  }

  getData() {
    return this.dataSubject.asObservable();
  }
  setPostDetails(data : any){
    this.postDetailsSubject.next(data);
  }
  getPostDetails(){
    return this.postDetailsSubject.asObservable();
  }
}
