import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../../user/service/user.service';
import { BusinessService } from '../../service/business.service';
import {
  BusinessRegisterRequest,
  BusinessSubCategoryMapping,
} from '../../model/Business';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from 'src/app/shared/service/common.service';
import { Overlay } from '@angular/cdk/overlay';
import {
  MAT_SELECT_SCROLL_STRATEGY,
  MatSelect,
} from '@angular/material/select';

export function selectRepositionScrollStrategy(overlay: Overlay) {
  return () => overlay.scrollStrategies.reposition();
}

@Component({
  selector: 'app-business-login',
  templateUrl: './business-login.component.html',
  styleUrls: ['./business-login.component.css'],

  providers: [
    {
      provide: MAT_SELECT_SCROLL_STRATEGY,
      useFactory: selectRepositionScrollStrategy,
      deps: [Overlay],
    },
  ],
})
export class BusinessLoginComponent implements OnInit, OnDestroy {
  @ViewChild('subCategorySelect') subCategorySelect?: MatSelect;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.subCategorySelect || !this.subCategorySelect.panelOpen) {
      return;
    }

    const target = event.target as HTMLElement;

    // Was the click inside the select trigger itself?
    const triggerEl = this.subCategorySelect._elementRef.nativeElement;
    const clickedTrigger = triggerEl.contains(target);

    // Was the click inside the overlay panel (checkboxes/options)?
    const panelEl = document.querySelector('.subcategory-select-panel');
    const clickedPanel = panelEl ? panelEl.contains(target) : false;

    if (!clickedTrigger && !clickedPanel) {
      this.subCategorySelect.close();
    }
  }

  // ===================== BASIC DETAILS =====================

  businessName: string = '';
  phoneNumber: string = '';
  userName: string = '';
  loggedInUserId: number = 0;

  // ===================== FORM STEPS =====================

  showAdditionalFields: boolean = false;
  otpSent: boolean = false;

  // ===================== OTP =====================

  otp: string = '';
  otpDigits: string[] = ['', '', '', ''];
  otpMessage: boolean = false;
  otpFailed: boolean = false;
  unauthorizedUser: boolean = false;
  registering: boolean = false;
  resendCountdown: number = 30;
  resendTimer: any;
  resendEnabled: boolean = false;

  // ===================== BASIC VALIDATION =====================

  businessNameErrorMessage: boolean = false;
  phoneNumberErrorMessage: boolean = false;
  otpErrorMessage: boolean = false;
  validBusinessNameMessage: boolean = false;
  validPhoneNumberMessage: boolean = false;
  validOTPMessage: boolean = false;
  validUserNameMessage: boolean = false;
  disableSendOTPButton: boolean = false;

  // ===================== BUSINESS DETAILS =====================

  businessCategoryId: number = 0;
  selectedBusinessSubCategoryIds: number[] = [];
  businessTypeId: number = 0;
  sellerTypeId: number = 0;
  pincode: string = '';
  state: string = '';
  city: string = '';
  nearBy: string = '';
  country: string = 'India';

  // ===================== BUSINESS VALIDATION =====================

  businessCategoryErrorMessage: boolean = false;
  businessSubCategoryErrorMessage: boolean = false;
  businessTypeErrorMessage: boolean = false;
  sellerTypeErrorMessage: boolean = false;
  pincodeErrorMessage: boolean = false;
  stateErrorMessage: boolean = false;
  cityErrorMessage: boolean = false;
  nearByErrorMessage: boolean = false;

  // ===================== DROPDOWN DATA =====================

  businessCategories: any[] = [];
  businessSubCategories: any[] = [];
  businessTypes: any[] = [];
  sellerTypes: any[] = [];
  dropdownDataLoading: boolean = true;

  // ===================== PINCODE DATA =====================

  postOffices: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BusinessLoginComponent>,
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem('firstName') || '';
    this.loggedInUserId = Number(localStorage.getItem('id')) || 0;
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.dropdownDataLoading = true;

    let pending = 3;

    const done = () => {
      pending--;

      if (pending === 0) {
        this.dropdownDataLoading = false;
      }
    };

    this.businessService.getBusinessCategories().subscribe((data: any) => {
      this.businessCategories = data;
      done();
    });

    this.businessService.getBusinessTypes().subscribe((data: any) => {
      this.businessTypes = data;
      done();
    });

    this.businessService.getSellerTypes().subscribe((data: any) => {
      this.sellerTypes = data;
      done();
    });
  }

  ngOnDestroy() {
    clearInterval(this.resendTimer);
  }

  // ===================== VALIDATORS =====================

  // validateUserName(): boolean {
  //   const regex = /^[a-zA-Z][a-zA-Z ]*$/;
  //   const isValid = regex.test(this.userName);
  //   this.validUserNameMessage = !isValid;
  //   return isValid;
  // }

  validateBusinessName(): boolean {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9 &.'-]*$/;
    return regex.test(this.businessName);
  }

  validatePhoneNumber(): boolean {
    const regex = /^[0-9]*$/;
    return regex.test(this.phoneNumber);
  }

  validateOTP(): boolean {
    const regex = /^[0-9]*$/;
    return regex.test(this.otp);
  }

  // ===================== PINCODE =====================

  allowOnlyNumbersPincode(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
    this.pincode = event.target.value;
  }

  getAddress(event: any) {
    const pincode = event.target.value;

    // Clear old address when user changes pincode
    if (pincode.length !== 6) {
      this.state = '';
      this.city = '';
      this.postOffices = [];
      this.nearBy = '';
      return;
    }

    this.commonService.getAddress(pincode).subscribe((data: any) => {
      if (data && data.length > 0 && data[0].PostOffice != null) {
        const address = data[0].PostOffice[0];

        this.state = address.State;
        this.city = address.District;
        this.country = address.Country || 'India';
        this.postOffices = data[0].PostOffice;

        if (this.postOffices.length > 1) {
          this.nearBy = this.postOffices[0].Name;
        } else {
          this.nearBy = address.Name;
        }
      } else {
        this.state = '';
        this.city = '';
        this.postOffices = [];
        this.nearBy = '';
      }
    });
  }

  // ===================== CATEGORY / SUB CATEGORY =====================

  onBusinessCategoryChange() {
    this.selectedBusinessSubCategoryIds = [];
    this.businessSubCategories = [];
    this.businessSubCategoryErrorMessage = false;

    if (!this.businessCategoryId) {
      return;
    }

    this.businessService
      .getBusinessSubCategories(this.businessCategoryId)
      .subscribe({
        next: (data: any) => {
          this.businessSubCategories = data || [];
        },
        error: (error) => {
          this.businessSubCategories = [];
        },
      });
  }

  onBusinessSubCategoryChange(selectedIds: number[]): void {
    this.selectedBusinessSubCategoryIds = selectedIds;

    this.businessSubCategoryErrorMessage =
      this.selectedBusinessSubCategoryIds.length === 0;
  }

  // ===================== STEP 1 -> STEP 2 =====================

  goToAdditionalFields() {
    this.businessNameErrorMessage = false;
    this.validBusinessNameMessage = false;
    this.validUserNameMessage = false;
    this.phoneNumberErrorMessage = false;
    this.validPhoneNumberMessage = false;

    if (!this.businessName || this.businessName.trim().length < 2) {
      this.businessNameErrorMessage = true;
      return;
    }

    if (!this.validateBusinessName()) {
      this.validBusinessNameMessage = true;
      return;
    }

    if (!this.userName || this.userName.trim().length < 2) {
      this.validUserNameMessage = true;
      return;
    }

    // if (!this.validateUserName()) {
    //   this.validUserNameMessage = true;
    //   return;
    // }

    const phoneNumberRegex = /^[0-9]{10}$/;

    if (!phoneNumberRegex.test(this.phoneNumber)) {
      this.phoneNumberErrorMessage = true;
      return;
    }

    this.showAdditionalFields = true;
    this.scrollFormToTop();
  }

  // ===================== STEP 2 -> STEP 1 =====================

  goBackToBasicDetails() {
    this.showAdditionalFields = false;

    this.businessCategoryErrorMessage = false;
    this.businessSubCategoryErrorMessage = false;
    this.businessTypeErrorMessage = false;
    this.sellerTypeErrorMessage = false;
    this.pincodeErrorMessage = false;
    this.stateErrorMessage = false;
    this.cityErrorMessage = false;
    this.nearByErrorMessage = false;

    this.scrollFormToTop();
  }

  // ===================== OTP STEP -> STEP 2 =====================

  goBackFromOtp(): void {
    clearInterval(this.resendTimer);
    this.otpSent = false;
    this.otpMessage = false;
    this.otpFailed = false;
    this.clearOtp();
  }

  private scrollFormToTop(): void {
    setTimeout(() => {
      const element = document.querySelector('.business-login-form-scroll');

      if (element) {
        element.scrollTop = 0;
      }
    });
  }

  // ===================== SEND OTP =====================

  sendOTP() {
    this.businessCategoryErrorMessage = false;
    this.businessSubCategoryErrorMessage = false;
    this.businessTypeErrorMessage = false;
    this.sellerTypeErrorMessage = false;
    this.pincodeErrorMessage = false;
    this.stateErrorMessage = false;
    this.cityErrorMessage = false;
    this.nearByErrorMessage = false;
    this.phoneNumberErrorMessage = false;
    this.businessNameErrorMessage = false;

    if (!this.businessName || this.businessName.trim().length < 2) {
      this.businessNameErrorMessage = true;
      this.showAdditionalFields = false;
      return;
    }

    if (
      !this.userName ||
      this.userName.trim().length < 2
      // || !this.validateUserName()
    ) {
      this.validUserNameMessage = true;
      this.showAdditionalFields = false;
      return;
    }

    const phoneNumberRegex = /^[0-9]{10}$/;

    if (!phoneNumberRegex.test(this.phoneNumber)) {
      this.phoneNumberErrorMessage = true;
      this.showAdditionalFields = false;
      return;
    }

    if (!this.businessCategoryId) {
      this.businessCategoryErrorMessage = true;
      return;
    }

    if (
      !this.selectedBusinessSubCategoryIds ||
      this.selectedBusinessSubCategoryIds.length === 0
    ) {
      this.businessSubCategoryErrorMessage = true;
      return;
    }

    const pincodeRegex = /^[0-9]{6}$/;

    if (!pincodeRegex.test(this.pincode)) {
      this.pincodeErrorMessage = true;
      return;
    }

    if (!this.state || this.state.trim().length < 2) {
      this.stateErrorMessage = true;
      return;
    }

    if (!this.city || this.city.trim().length < 2) {
      this.cityErrorMessage = true;
      return;
    }

    if (!this.nearBy) {
      this.nearByErrorMessage = true;
      return;
    }

    const createdOn = new Date().toISOString();

    this.userService
      .sendLoginOTP(this.phoneNumber, '0.0.0.0', createdOn)
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
        },
      );
  }

  // ===================== REGISTER BUSINESS =====================

  registerBusiness() {
    this.otpErrorMessage = false;
    this.unauthorizedUser = false;

    if (!this.otp || this.otp.trim().length === 0) {
      this.otpErrorMessage = true;
      return;
    }

    const otpRegex = /^[0-9]{4,6}$/;

    if (!otpRegex.test(this.otp)) {
      this.otpErrorMessage = true;
      return;
    }

    const now = new Date().toISOString();
    const nowShort = now.slice(0, 23);

    const payload = new BusinessRegisterRequest();

    // ----- USERS -----
    payload.users.otp = Number(this.otp);
    payload.users.mobileNo = this.phoneNumber;
    payload.users.name = this.userName || this.businessName;

    // ----- BUSINESS -----
    payload.business.businessName = this.businessName;
    payload.business.tabRefGUID = this.generateGuid();
    payload.business.userId = this.loggedInUserId;
    payload.business.createdBy = this.loggedInUserId;
    payload.business.createdOn = nowShort;
    payload.business.modifiedBy = this.loggedInUserId;
    payload.business.modifiedOn = nowShort;
    payload.business.isDeleted = false;
    payload.business.deletedBy = 0;

    // ----- CATEGORY -----
    payload.business.businessCategoryId = this.businessCategoryId;
    payload.business.businessTypeId = this.businessTypeId;
    payload.business.sellerTypeId = this.sellerTypeId;

    // ----- SUB CATEGORY MAPPINGS -----
    payload.business.businessSubCategoryMappings =
      this.selectedBusinessSubCategoryIds.map((subCategoryId: number) => {
        const mapping = new BusinessSubCategoryMapping();

        mapping.id = 0;
        mapping.businessId = 0;

        mapping.businessSubCategoryId = subCategoryId;
        mapping.businessCategoryId = this.businessCategoryId;

        mapping.createdBy = this.loggedInUserId;
        mapping.createdOn = nowShort;

        mapping.modifiedBy = this.loggedInUserId;
        mapping.modifiedOn = nowShort;

        mapping.isDeleted = false;
        mapping.deletedBy = 0;

        return mapping;
      });

    // ----- CONTACT -----
    payload.business.businessContact.contactPerson =
      this.userName || this.businessName;
    payload.business.businessContact.mobile = this.phoneNumber;
    payload.business.businessContact.createdBy = this.loggedInUserId;
    payload.business.businessContact.createdOn = nowShort;
    payload.business.businessContact.modifiedBy = this.loggedInUserId;
    payload.business.businessContact.modifiedOn = nowShort;
    payload.business.businessContact.isDeleted = false;
    payload.business.businessContact.deletedBy = 0;

    // ----- VERIFICATION -----
    payload.business.businessVerification.createdBy = this.loggedInUserId;
    payload.business.businessVerification.createdOn = nowShort;
    payload.business.businessVerification.modifiedBy = this.loggedInUserId;
    payload.business.businessVerification.modifiedOn = nowShort;
    payload.business.businessVerification.isDeleted = false;
    payload.business.businessVerification.deletedBy = 0;

    // ----- SOCIAL MEDIA -----
    payload.business.businessSocialMedia.createdBy = this.loggedInUserId;
    payload.business.businessSocialMedia.createdOn = nowShort;
    payload.business.businessSocialMedia.modifiedBy = this.loggedInUserId;
    payload.business.businessSocialMedia.modifiedOn = nowShort;
    payload.business.businessSocialMedia.isDeleted = false;
    payload.business.businessSocialMedia.deletedBy = 0;

    // ----- ADDRESS -----
    payload.business.businessAddress.createdBy = this.loggedInUserId;
    payload.business.businessAddress.createdOn = nowShort;
    payload.business.businessAddress.modifiedBy = this.loggedInUserId;
    payload.business.businessAddress.modifiedOn = nowShort;
    payload.business.businessAddress.isDeleted = false;
    payload.business.businessAddress.deletedBy = 0;
    payload.business.businessAddress.pincode = this.pincode;
    payload.business.businessAddress.state = this.state;
    payload.business.businessAddress.city = this.city;
    payload.business.businessAddress.country = this.country;
    payload.business.businessAddress.area = this.nearBy;

    // ----- WORKING HOURS -----
    const days = [1, 2, 3, 4, 5, 6, 7];

    payload.business.businessWorkingHoursList = days.map((day) => ({
      createdBy: this.loggedInUserId,
      createdOn: nowShort,
      modifiedBy: this.loggedInUserId,
      modifiedOn: nowShort,
      isDeleted: false,
      deletedDate: nowShort,
      deletedBy: 0,
      id: 0,
      businessId: 0,
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: day === 7,
    }));

    // ----- GALLERY -----
    payload.business.businessGalleryList = [
      {
        createdBy: this.loggedInUserId,
        createdOn: nowShort,
        modifiedBy: this.loggedInUserId,
        modifiedOn: nowShort,
        isDeleted: false,
        deletedDate: nowShort,
        deletedBy: 0,
        id: 0,
        businessId: 0,
        imageUrl: '',
        thumbnailUrl: '',
        caption: '',
        displayOrder: 0,
      },
    ];

    // ----- SAVE -----
    this.registering = true;

    this.businessService.saveBusiness(payload).subscribe(
      (data: any) => {
        this.registering = false;
        this.dialogRef.close();
        this.showNotification('Business Registered Successfully');
        this.router.navigate(['/business/profile']);
      },

      (error) => {
        this.registering = false;
        this.unauthorizedUser = true;

        setTimeout(() => {
          this.unauthorizedUser = false;
        }, 5000);
      },
    );
  }

  // ===================== UTILITIES =====================

  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // ===================== OTP COUNTDOWN / RESEND =====================

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

  // ===================== OTP BOXES =====================

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
