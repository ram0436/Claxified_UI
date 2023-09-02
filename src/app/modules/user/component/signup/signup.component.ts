import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  confirmPassword: string = '';
  payload: any = {
    "id": 0,
    "userId": "",
    "password": "",
    "userImageList": [],
    "role": 0,
    "firstName": "",
    "lastName": "",
    "mobileNo": "",
    "watsAppNo": "",
    "email": "",
    "isBlockedUser": true,
    "isActiveUser": true,
    "aboutMe": ""
  }

  constructor(private userService: UserService, private dialogRef: MatDialogRef<SignupComponent>,
    private snackBar: MatSnackBar) { }
  signUp() {
    if (this.payload.password == this.confirmPassword) {
      this.payload.userId = this.payload.email;
      this.payload.watsAppNo = this.payload.mobileNo;
      this.userService.register(this.payload).subscribe(data => {
        this.dialogRef.close();
        this.showNotification("Account created successfully");
      })
    }
  }
  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 100000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
  handleConfirmPassword(event : any){
    this.confirmPassword = event.target.value;
  }
}
