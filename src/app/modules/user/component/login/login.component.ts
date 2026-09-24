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
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  phoneNumber: string = '';
  password: string = '';
  otp: string = '';
  otpDigits: string[] = ['', '', '', ''];
  firstName: string = '';
  otpSent: boolean = false;
  otpMessage: boolean = false;
  otpFailed: boolean = false;
  unauthorizedUser: boolean = false;
  loginSuccessfull: boolean = false;

  resendCountdown: number = 30;
  resendTimer: any;
  resendEnabled: boolean = false;

  phoneNumberErrorMessage: boolean = false;
  otpErrorMessage: boolean = false;
  firstNameErrorMessage: boolean = false;

  validPhoneNumberMessage: boolean = false;
  validOTPMessage: boolean = false;
  validFirstNameMessage: boolean = false;

  disableSendOTPButton: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router,
    private dialogRef: MatDialogRef<LoginComponent>,
    private snackBar: MatSnackBar,
  ) {}

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

  validateOTP(): boolean {
    if (this.loginSuccessfull) {
      const regex = /^[0-9]+$/;
      const isValid = regex.test(this.otp);
      this.disableSendOTPButton =
        !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    } else {
      const regex = /^[0-9]*$/;
      const isValid = regex.test(this.otp);
      this.disableSendOTPButton =
        !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    }
  }

  validateFirstName(): boolean {
    if (this.loginSuccessfull) {
      const regex = /^[a-zA-Z][a-zA-Z ]+$/;
      const isValid = regex.test(this.firstName);
      this.disableSendOTPButton =
        !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    } else {
      const regex = /^[a-zA-Z][a-zA-Z ]*$/;
      const isValid = regex.test(this.firstName);
      this.disableSendOTPButton =
        !isValid || this.validOTPMessage || this.validFirstNameMessage;
      return isValid;
    }
  }

  signIn() {
    let payload = { userId: this.email, password: this.password };
    this.userService.login(payload).subscribe((data: any) => {
      localStorage.setItem('role', data.role);
      localStorage.setItem('authToken', data.authToken);
      localStorage.setItem('id', data.id);
      this.dialogRef.close();
      this.userService.setData('login');
      if (data.role == 'Admin')
        this.router.navigate(['/my-claxidied/dashboard']);
      else this.router.navigate(['/my-claxidied/dashboard']);
    });
  }

  ngOnDestroy() {
    clearInterval(this.resendTimer);
  }

  sendOTP() {
    this.phoneNumberErrorMessage = false;
    this.firstNameErrorMessage = false;

    // Name is now entered on step 1
    if (!/^[a-zA-Z][a-zA-Z ]+$/.test(this.firstName.trim())) {
      this.firstNameErrorMessage = true;
      return;
    }

    const phoneNumberRegex = /^[0-9]{10}$/;
    if (!phoneNumberRegex.test(this.phoneNumber)) {
      this.phoneNumberErrorMessage = true;
      return;
    }

    if (this.phoneNumber.length !== 10) {
      this.phoneNumberErrorMessage = true;
      return;
    }

    this.httpClient
      .get('https://api64.ipify.org?format=json')
      .subscribe((ipInfo: any) => {
        const ipAddress = ipInfo.ip;
        const createdOn = new Date().toISOString();
        this.userService
          .sendLoginOTP(this.phoneNumber, ipAddress, createdOn)
          .subscribe(
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
            },
          );
      });
  }

  loginWithOTP() {
    this.otpErrorMessage = false;
    this.firstNameErrorMessage = false;

    const otpRegex = /^[0-9]+$/;
    if (!otpRegex.test(this.otp)) {
      this.otpErrorMessage = true;
      return;
    }

    const firstNameRegex = /^[a-zA-Z][a-zA-Z ]*$/;
    if (!firstNameRegex.test(this.firstName)) {
      this.firstNameErrorMessage = true;
      return;
    }

    if (this.firstName.length < 2) {
      this.firstNameErrorMessage = true;
    }

    if (!this.firstNameErrorMessage && !this.otpErrorMessage) {
      const requestPayload = {
        mobileNo: this.phoneNumber,
        otp: parseInt(this.otp, 10),
        firstName: this.firstName,
      };

      this.userService
        .OTPLogin(
          requestPayload.mobileNo,
          requestPayload.otp,
          requestPayload.firstName,
        )
        .subscribe(
          (data: any) => {
            this.loginSuccessfull = true;
            localStorage.setItem('role', data.role);
            localStorage.setItem('authToken', data.authToken);
            localStorage.setItem('id', data.id);
            localStorage.setItem('firstName', data.firstName);
            this.dialogRef.close();
            this.userService.setData('login');
            if (data.role == 'Admin')
              this.router.navigate(['/my-claxified/admin-overview']);
            else this.router.navigate(['/my-claxified/settings']);
          },
          (error) => {
            this.unauthorizedUser = true;
            setTimeout(() => {
              this.unauthorizedUser = false;
            }, 5000);
          },
        );
    }
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  startResendCountdown() {
    this.resendEnabled = false;
    this.resendCountdown = 30;
    clearInterval(this.resendTimer);
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
      this.clearOtp();
      this.sendOTP();
    }
  }

  // =========================================================
  // "CHANGE NUMBER" (back from OTP step)
  // =========================================================

  changeNumber(): void {
    clearInterval(this.resendTimer);
    this.otpSent = false;
    this.otpMessage = false;
    this.clearOtp();
  }

  // =========================================================
  // OTP BOXES
  // =========================================================

  trackByIndex(index: number): number {
    return index;
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    input.value = digit;
    this.otpDigits[index] = digit;
    this.syncOtp();
    if (digit && index < this.otpDigits.length - 1) {
      this.focusOtpBox(input, index + 1);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.focusOtpBox(input, index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusOtpBox(input, index - 1);
    } else if (
      event.key === 'ArrowRight' &&
      index < this.otpDigits.length - 1
    ) {
      this.focusOtpBox(input, index + 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, this.otpDigits.length);
    if (!text) return;
    this.otpDigits = this.otpDigits.map((_, i) => text[i] || '');
    this.syncOtp();
    this.focusOtpBox(
      event.target as HTMLInputElement,
      Math.min(text.length, this.otpDigits.length - 1),
    );
  }

  private syncOtp(): void {
    this.otp = this.otpDigits.join('');
    this.validOTPMessage = false;
    this.otpErrorMessage = false;
  }

  private focusOtpBox(from: HTMLInputElement, index: number): void {
    const boxes = from.parentElement?.querySelectorAll('input');
    (boxes?.[index] as HTMLInputElement | undefined)?.focus();
  }

  private clearOtp(): void {
    this.otpDigits = ['', '', '', ''];
    this.otp = '';
  }
}
