import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  imageUrl = "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg";
  userData: any;
  constructor(private userService: UserService, @Inject(DOCUMENT) private document: Document) { }

  selectFile() {
    if (this.document) {
      const uploadElement = this.document.getElementById("upload");
      if (uploadElement) {
        uploadElement.click();
      }
    }
  }
  uploadProfilePicture(event: any) {
    var files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    this.userService.uploadProfilePicture(formData).subscribe((data: any) => {
      if (data.length > 0) {
        this.imageUrl = data[0];
        this.userService.getUserById(Number(localStorage.getItem("id"))).subscribe((userData: any) => {
          if (userData.length > 0) {
            userData[0].userImageList.push({ "id": 0, "imageId": "st", "imageURL": data[0], "usersId": Number(localStorage.getItem("id")) });
            this.userService.updateUser(userData[0]).subscribe(res => {
              console.log(res);
            })
          }
        })
      }
    })
  }
  ngOnInit() {
    if (localStorage.getItem("id") != null) {
      this.userService.getUserById(Number(localStorage.getItem("id"))).subscribe((userData: any) => {
        this.userData = userData[0];
        if (this.userData.userImageList.length > 0) {
          this.imageUrl = this.userData.userImageList[this.userData.userImageList.length - 1].imageURL;
        }
      });
    }
  }
}
