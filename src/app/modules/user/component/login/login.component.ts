import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';

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
  loginSuccessfull: boolean = false;

  resendCountdown: number = 30;
  resendTimer: any;
  resendEnabled: boolean = false;

  phoneNumberErrorMessage: boolean = false;
  otpErrorMessage: boolean =false;
  firstNameErrorMessage: boolean = false;

  validPhoneNumberMessage: boolean = false;
  validOTPMessage: boolean = false;
  validFirstNameMessage: boolean = false;

  disableSendOTPButton: boolean = false;


constructor(private httpClient: HttpClient, private userService: UserService, private router: Router, private dialogRef: MatDialogRef<LoginComponent>, private snackBar: MatSnackBar) { }

validatePhoneNumber(): boolean {
  if (this.otpSent) {
    const regex = /^[0-9]{10}$/;
    const isValid = regex.test(this.phoneNumber);
    this.disableSendOTPButton = !isValid || this.validPhoneNumberMessage;
    return isValid;
  } else {
    const regex = /^[0-9]*$/;
    const isValid = regex.test(this.phoneNumber);
    this.disableSendOTPButton = !isValid || this.validPhoneNumberMessage;
    return isValid;
  }
}


  validateOTP(): boolean{
    if (this.loginSuccessfull) {
    const regex = /^[0-9]{4}$/;
    const isValid = regex.test(this.otp);
    this.disableSendOTPButton = !isValid || this.validOTPMessage || this.validFirstNameMessage;
    return isValid;
    } else {
      const regex = /^[0-9]*$/;
      const isValid = regex.test(this.otp);
      this.disableSendOTPButton = !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    }
  }

  validateFirstName(): boolean {
    if (this.loginSuccessfull) {
      const regex = /^[a-zA-Z][a-zA-Z ]+$/;
      const isValid = regex.test(this.firstName);
      this.disableSendOTPButton = !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    } else {
      const regex = /^[a-zA-Z][a-zA-Z ]*$/;
      const isValid = regex.test(this.firstName);
      this.disableSendOTPButton = !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    }
  }
  

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

  ngOnDestroy() {
    clearInterval(this.resendTimer);
  }

  sendOTP() {

    this.phoneNumberErrorMessage = false;

    const phoneNumberRegex = /^[0-9]{10}$/;
    if (!phoneNumberRegex.test(this.phoneNumber)) {
      this.phoneNumberErrorMessage = true;
      return;
    }


    if (this.phoneNumber.length !== 10) {
      this.phoneNumberErrorMessage = true;
      return;
   }


    this.httpClient.get('https://api64.ipify.org?format=json').subscribe((ipInfo: any) => {
      const ipAddress = ipInfo.ip;
      const createdOn = new Date().toISOString()
      this.userService.sendLoginOTP(this.phoneNumber, ipAddress, createdOn).subscribe(
        (response: any) => {
          this.otpSent = true;
          this.otpMessage = true;
          this.startResendCountdown();
          setTimeout(() => {
            this.otpMessage = false; 
          }, 5000);
        },
        (error) => {
          this.otpFailed = true; 
          setTimeout(() => {
            this.otpFailed = false; 
          }, 5000);
        }
      );
    });
  }

  loginWithOTP() {
    this.otpErrorMessage = false;
    this.firstNameErrorMessage = false;

    const otpRegex = /^[0-9]{4}$/;
    if (!otpRegex.test(this.otp)) {
      this.otpErrorMessage = true;
      return;
    }

    const firstNameRegex = /^[a-zA-Z][a-zA-Z ]*$/;
    if (!firstNameRegex.test(this.firstName)) {
      this.firstNameErrorMessage = true;
      return;
    }
  
    if (this.otp.length !== 4) {
      this.otpErrorMessage = true;
    }
  
    if (this.firstName.length < 2) {
      this.firstNameErrorMessage = true;
    }

    if (!this.firstNameErrorMessage && !this.otpErrorMessage) {
      const requestPayload = {
        mobileNo: this.phoneNumber,
        otp: parseInt(this.otp, 10),
        firstName: this.firstName
      };


      this.userService.OTPLogin(requestPayload.mobileNo, requestPayload.otp, requestPayload.firstName)
        .subscribe((data: any) => {
            this.loginSuccessfull = true;
            localStorage.setItem("role", data.role);
            localStorage.setItem("authToken", data.authToken);
            localStorage.setItem("id", data.id);
            this.dialogRef.close();
            this.userService.setData("login");
            if (data.role == 'Admin')
              this.router.navigate(['/Admin/admin-dashboard']);
            else this.router.navigate(['/user/account']);
        }, error => {
          this.unauthorizedUser = true;
          setTimeout(() => {
            this.unauthorizedUser = false; 
          }, 5000);
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

  startResendCountdown() {
    this.resendEnabled = false;
    this.resendCountdown = 30;
    this.resendTimer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.resendTimer);
        this.resendEnabled = true;
      }
    }, 1000);
  }
  
  resendOTP() {
    if (this.resendEnabled) {
      this.sendOTP();
    }
  }



}
