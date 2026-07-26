import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { UserService } from "../../../user/service/user.service";

@Component({
  selector: "app-business-login",
  templateUrl: "./business-login.component.html",
  styleUrls: ["./business-login.component.css"],
})
export class BusinessLoginComponent {
  businessName: string = "";
  phoneNumber: string = "";
  otp: string = "";

  otpSent: boolean = false;
  otpMessage: boolean = false;
  otpFailed: boolean = false;
  unauthorizedUser: boolean = false;
  loginSuccessful: boolean = false;

  resendCountdown: number = 30;
  resendTimer: any;
  resendEnabled: boolean = false;

  businessNameErrorMessage: boolean = false;
  phoneNumberErrorMessage: boolean = false;
  otpErrorMessage: boolean = false;

  validBusinessNameMessage: boolean = false;
  validPhoneNumberMessage: boolean = false;
  validOTPMessage: boolean = false;

  disableSendOTPButton: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router,
    private dialogRef: MatDialogRef<BusinessLoginComponent>
  ) {}

  ngOnDestroy() {
    clearInterval(this.resendTimer);
  }

  validateBusinessName(): boolean {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9 &.'-]*$/;
    const isValid = regex.test(this.businessName);
    this.disableSendOTPButton = !isValid;
    return isValid;
  }

  validatePhoneNumber(): boolean {
    const regex = this.otpSent ? /^[0-9]{10}$/ : /^[0-9]*$/;
    const isValid = regex.test(this.phoneNumber);
    this.disableSendOTPButton = !isValid || this.validBusinessNameMessage;
    return isValid;
  }

  validateOTP(): boolean {
    const regex = /^[0-9]*$/;
    const isValid = regex.test(this.otp);
    this.disableSendOTPButton = !isValid;
    return isValid;
  }

  sendOTP() {
    this.businessNameErrorMessage = false;
    this.phoneNumberErrorMessage = false;

    if (!this.businessName || this.businessName.trim().length < 2) {
      this.businessNameErrorMessage = true;
      return;
    }

    const phoneNumberRegex = /^[0-9]{10}$/;
    if (!phoneNumberRegex.test(this.phoneNumber)) {
      this.phoneNumberErrorMessage = true;
      return;
    }

    this.httpClient
      .get("https://api64.ipify.org?format=json")
      .subscribe((ipInfo: any) => {
        const ipAddress = ipInfo.ip;
        const createdOn = new Date().toISOString();
        this.userService
          .sendLoginOTP(this.phoneNumber, ipAddress, createdOn)
          .subscribe(
            () => {
              this.otpSent = true;
              this.otpMessage = true;
              this.startResendCountdown();
              setTimeout(() => {
                this.otpMessage = false;
              }, 5000);
            },
            () => {
              this.otpFailed = true;
              setTimeout(() => {
                this.otpFailed = false;
              }, 5000);
            }
          );
      });
  }

  verifyOTPAndRegister() {
    this.otpErrorMessage = false;

    if (!this.otp || this.otp.trim().length === 0) {
      this.otpErrorMessage = true;
      return;
    }

    const otpRegex = /^[0-9]+$/;
    if (!otpRegex.test(this.otp)) {
      this.otpErrorMessage = true;
      return;
    }

    const requestPayload = {
      mobileNo: this.phoneNumber,
      otp: parseInt(this.otp, 10),
      businessName: this.businessName,
    };

    this.userService
      .OTPLogin(
        requestPayload.mobileNo,
        requestPayload.otp,
        requestPayload.businessName
      )
      .subscribe(
        (data: any) => {
          this.loginSuccessful = true;
          localStorage.setItem("role", data.role);
          localStorage.setItem("authToken", data.authToken);
          localStorage.setItem("id", data.id);
          this.dialogRef.close();
          this.userService.setData("business-login");
          this.router.navigate(["/business/profile/edit"]);
        },
        () => {
          this.unauthorizedUser = true;
          setTimeout(() => {
            this.unauthorizedUser = false;
          }, 5000);
        }
      );
  }

  closeDialog() {
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
