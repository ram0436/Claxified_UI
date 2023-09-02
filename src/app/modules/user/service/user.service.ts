import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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
}
