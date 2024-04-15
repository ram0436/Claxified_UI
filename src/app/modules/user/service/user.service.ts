import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private BaseURL = environment.baseUrl;
  private dataSubject = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  login(payload: any) {
    return this.httpClient.post(`${this.BaseURL}Auth`, payload);
  }
  register(payload: any) {
    return this.httpClient.post(`${this.BaseURL}User`, payload);
  }
  AdReportByUser(payload: any) {
    return this.httpClient.post(`${this.BaseURL}User/AdReportByUser`, payload);
  }
  AddWishList(payload: any) {
    return this.httpClient.post(`${this.BaseURL}User/AddWishList`, payload);
  }
  GetWishlistByUserId(userId: number) {
    const url = `${this.BaseURL}User/GetWishlistByUserId?userId=${userId}`;
    return this.httpClient.get(url);
  }
  uploadProfilePicture(formData: any) {
    return this.httpClient.post(`${this.BaseURL}User/UploadImages`, formData);
  }
  getUserById(id: number) {
    return this.httpClient.get(`${this.BaseURL}User/` + id);
  }
  updateUser(payload: any) {
    return this.httpClient.put(`${this.BaseURL}User/` + payload.id, payload);
  }
  setData(data: any) {
    this.dataSubject.next(data);
  }
  getData() {
    return this.dataSubject.asObservable();
  }

  applyForVacancy(vacancyData: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.BaseURL}User/ApplyForVacancy`,
      vacancyData
    );
  }

  uploadResume(formData: any) {
    return this.httpClient.post(`${this.BaseURL}User/uploadResume`, formData);
  }

  sendLoginOTP(
    mobileNumber: string,
    ipAddress: string,
    createdOn: string
  ): Observable<any> {
    const url = `${this.BaseURL}Auth/SendLoginOTP`;
    const body = {
      mobile: mobileNumber,
      ipAddress: ipAddress,
      createdOn: createdOn,
    };
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.httpClient.post(url, body, { headers: headers });
  }

  OTPLogin(mobileNo: string, otp: number, firstName: string): Observable<any> {
    const url = `${this.BaseURL}Auth/OTPLogin?mobileNo=${mobileNo}&otp=${otp}&firstName=${firstName}`;
    return this.httpClient.post(url, null, {
      headers: new HttpHeaders({
        Accept: "*/*",
      }),
    });
  }

  addUserFeedback(requestBody: any) {
    return this.httpClient.post(
      `${this.BaseURL}User/AddUserFeedback`,
      requestBody
    );
  }

  deleteAd(id: number, category: string): Observable<any> {
    const apiUrl = `${this.BaseURL}${category}/${id}`;
    return this.httpClient.delete(apiUrl);
  }
}
