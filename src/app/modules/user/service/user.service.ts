import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private dataSubject = new Subject<any>();

  constructor(private httpClient: HttpClient) { }

  login(payload: any) {
    return this.httpClient.post("https://cfd.azurewebsites.net/api/Auth", payload);
  }
  register(payload: any) {
    return this.httpClient.post("https://cfd.azurewebsites.net/api/User", payload);
  }
  AdReportByUser(payload: any) {
    return this.httpClient.post("https://cfd.azurewebsites.net//api/User/AdReportByUser", payload);
  }
  AddWishList(payload: any) {
    return this.httpClient.post("https://cfd.azurewebsites.net/api/User/AddWishList", payload);
  }
  GetWishlistByUserId(userId: number) {
    const url = `https://cfd.azurewebsites.net/api/User/GetWishlistByUserId?userId=${userId}`;
    return this.httpClient.get(url);
  }
  uploadProfilePicture(formData: any) {
    return this.httpClient.post("https://cfd.azurewebsites.net/api/User/UploadImages", formData);
  }
  getUserById(id: number) {
    return this.httpClient.get("https://cfd.azurewebsites.net/api/User/" + id);
  }
  updateUser(payload: any) {
    return this.httpClient.put("https://cfd.azurewebsites.net/api/User/" + payload.id, payload);
  }
  setData(data: any) {
    this.dataSubject.next(data);
  }
  getData() {
    return this.dataSubject.asObservable();
  }

  applyForVacancy(vacancyData: any): Observable<any> {
    return this.httpClient.post<any>(`https://cfd.azurewebsites.net/api/User/ApplyForVacancy`, vacancyData);
  }

  uploadResume(formData: any){

    return this.httpClient.post(`https://cfd.azurewebsites.net/api/User/uploadResume`, formData);
  }

  sendLoginOTP(mobileNumber: string, ipAddress: string): Observable<any> {
    const url = `https://cfd.azurewebsites.net/api/Auth/SendLoginOTP`;
    const body = { mobile: mobileNumber, ipAddress: ipAddress };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post(url, body, { headers: headers });
  }

  OTPLogin(mobileNo: string, otp: number, firstName: string): Observable<any> {
    const url = `https://cfd.azurewebsites.net/api/Auth/OTPLogin?mobileNo=${mobileNo}&otp=${otp}&firstName=${firstName}`;
    return this.httpClient.post(url, null, {
      headers: new HttpHeaders({
        'Accept': '*/*'
      })
    });
  }

}
