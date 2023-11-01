import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = "";
  phoneNumber: string = "";
  password: string = "";
  otp: string = "";
  firstName: string = "";
  otpSent: boolean = false;
  otpMessage: boolean = false;
  otpFailed: boolean = false;
  unauthorizedUser: boolean = false;


  constructor(private userService: UserService, private router: Router, private dialogRef: MatDialogRef<LoginComponent>, private snackBar: MatSnackBar) { }
  signIn() {
    let payload = { userId: this.email, password: this.password };
    this.userService.login(payload).subscribe((data: any) => {
      localStorage.setItem("role", data.role);
      localStorage.setItem("authToken", data.authToken);
      localStorage.setItem("id", data.id);
      this.dialogRef.close();
      this.userService.setData("login");
      if (data.role == 'Admin')
        this.router.navigate(['/Admin/admin-dashboard']);
      else this.router.navigate(['/user/account']);
    })
  }

  sendOTP() {
    this.userService.sendLoginOTP(this.phoneNumber).subscribe((response: any) => {
      this.otpSent = true;
      this.otpMessage = true;
      // this.showNotification("OTP has been sent successfully")
      setTimeout(() => {
        this.otpMessage = false; 
      }, 3000);
    }, error => {
      this.otpFailed = true; 
      setTimeout(() => {
        this.otpFailed = false; 
      }, 3000);
      // this.showNotification("Error sending OTP")
    });
  }

  loginWithOTP() {
    if (this.phoneNumber && this.otp && this.firstName) {
      const requestPayload = {
        mobileNo: this.phoneNumber,
        otp: parseInt(this.otp, 10),
        firstName: this.firstName
      };

      this.userService.OTPLogin(requestPayload.mobileNo, requestPayload.otp, requestPayload.firstName)
        .subscribe((data: any) => {
            localStorage.setItem("role", data.role);
            localStorage.setItem("authToken", data.authToken);
            localStorage.setItem("id", data.id);
            this.dialogRef.close();
            this.userService.setData("login");
            if (data.role == 'Admin')
              this.router.navigate(['/user/admin']);
            else this.router.navigate(['/user/account']);
        }, error => {
          this.unauthorizedUser = true;
          setTimeout(() => {
            this.unauthorizedUser = false; 
          }, 3000);
        });
    }
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }


  closeDialog(){
    this.dialogRef.close();
  }

}
