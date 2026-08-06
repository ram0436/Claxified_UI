import { Component, OnDestroy, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { UserService } from "../../../user/service/user.service";
import { BusinessService } from "../../service/business.service";
import { BusinessRegisterRequest } from "../../model/Business";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonService } from "src/app/shared/service/common.service";
import { Overlay } from "@angular/cdk/overlay";
import { MAT_SELECT_SCROLL_STRATEGY } from "@angular/material/select";

export function selectRepositionScrollStrategy(overlay: Overlay) {
  return () => overlay.scrollStrategies.reposition();
}

@Component({
  selector: "app-business-login",
  templateUrl: "./business-login.component.html",
  styleUrls: ["./business-login.component.css"],
  providers: [
    {
      provide: MAT_SELECT_SCROLL_STRATEGY,
      useFactory: selectRepositionScrollStrategy,
      deps: [Overlay],
    },
  ],
})
export class BusinessLoginComponent implements OnInit, OnDestroy {
  businessName: string = "";
  phoneNumber: string = "";
  otp: string = "";

  otpSent: boolean = false;
  otpMessage: boolean = false;
  otpFailed: boolean = false;
  unauthorizedUser: boolean = false;
  registering: boolean = false;

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

  userName: string = "";
  loggedInUserId: number = 0;

  businessCategoryId: number = 0;
  businessSubCategoryId: number = 0;
  businessTypeId: number = 0;
  sellerTypeId: number = 0;
  pincode: string = "";
  state: string = "";
  city: string = "";
  nearBy: string = "";
  country: string = "India";

  businessCategoryErrorMessage: boolean = false;
  businessSubCategoryErrorMessage: boolean = false;
  businessTypeErrorMessage: boolean = false;
  sellerTypeErrorMessage: boolean = false;
  pincodeErrorMessage: boolean = false;
  stateErrorMessage: boolean = false;
  cityErrorMessage: boolean = false;
  nearByErrorMessage: boolean = false;

  businessCategories: any[] = [];
  businessSubCategories: any[] = [];
  businessTypes: any[] = [];
  sellerTypes: any[] = [];
  dropdownDataLoading: boolean = true;

  postOffices: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BusinessLoginComponent>
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem("firstName") || "";
    this.loggedInUserId = Number(localStorage.getItem("id")) || 0;
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.dropdownDataLoading = true;
    let pending = 3;
    const done = () => {
      pending--;
      if (pending === 0) this.dropdownDataLoading = false;
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

  validateUserName(): boolean {
    const regex = /^[a-zA-Z][a-zA-Z ]*$/;
    const isValid = regex.test(this.userName);
    this.disableSendOTPButton = !isValid;
    return isValid;
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

  allowOnlyNumbersPincode(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, "");
    this.pincode = event.target.value;
  }

  getAddress(event: any) {
    const pincode = event.target.value;
    if (pincode.length === 6) {
      this.commonService.getAddress(pincode).subscribe((data: any) => {
        if (data[0].PostOffice != null) {
          const address = data[0].PostOffice[0];
          this.state = address.State;
          this.city = address.District;
          this.country = address.Country || "India";
          this.postOffices = data[0].PostOffice;
          if (this.postOffices.length > 1) {
            this.nearBy = this.postOffices[0].Name;
          } else {
            this.nearBy = address.Name;
          }
        } else {
          this.state = "";
          this.city = "";
          this.postOffices = [];
          this.nearBy = "";
        }
      });
    }
  }

  onBusinessCategoryChange() {
    this.businessSubCategoryId = 0;
    this.businessSubCategories = [];

    if (!this.businessCategoryId) {
      return;
    }

    this.businessService
      .getBusinessSubCategories(this.businessCategoryId)
      .subscribe((data: any) => {
        this.businessSubCategories = data;
      });
  }

  generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  sendOTP() {
    this.phoneNumberErrorMessage = false;
    this.businessNameErrorMessage = false;
    this.businessCategoryErrorMessage = false;
    this.businessSubCategoryErrorMessage = false;
    this.businessTypeErrorMessage = false;
    this.sellerTypeErrorMessage = false;
    this.pincodeErrorMessage = false;
    this.stateErrorMessage = false;
    this.cityErrorMessage = false;
    this.nearByErrorMessage = false;

    if (!this.businessName || this.businessName.trim().length < 2) {
      this.businessNameErrorMessage = true;
      return;
    }

    const phoneNumberRegex = /^[0-9]{10}$/;
    if (!phoneNumberRegex.test(this.phoneNumber)) {
      this.phoneNumberErrorMessage = true;
      return;
    }

    if (!this.businessCategoryId) {
      this.businessCategoryErrorMessage = true;
      return;
    }

    if (!this.businessSubCategoryId) {
      this.businessSubCategoryErrorMessage = true;
      return;
    }

    if (!this.businessTypeId) {
      this.businessTypeErrorMessage = true;
      return;
    }

    if (!this.sellerTypeId) {
      this.sellerTypeErrorMessage = true;
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
      .sendLoginOTP(this.phoneNumber, "0.0.0.0", createdOn)
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
  }

  registerBusiness() {
    this.otpErrorMessage = false;

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

    // ---------- users ----------
    payload.users.otp = Number(this.otp);
    payload.users.mobileNo = this.phoneNumber;
    payload.users.name = this.userName || this.businessName;

    // ---------- business (top-level) ----------
    payload.business.businessName = this.businessName;
    payload.business.tabRefGUID = this.generateGuid();
    payload.business.userId = this.loggedInUserId;
    payload.business.createdBy = this.loggedInUserId;
    payload.business.createdOn = nowShort;
    payload.business.modifiedBy = this.loggedInUserId;
    payload.business.modifiedOn = nowShort;
    payload.business.isDeleted = false;
    payload.business.deletedBy = 0;

    payload.business.businessCategoryId = this.businessCategoryId;
    payload.business.businessSubCategoryId = this.businessSubCategoryId;
    payload.business.businessTypeId = this.businessTypeId;
    payload.business.sellerTypeId = this.sellerTypeId;

    // ---------- businessContact ----------
    payload.business.businessContact.contactPerson =
      this.userName || this.businessName;
    payload.business.businessContact.mobile = this.phoneNumber;
    payload.business.businessContact.createdBy = this.loggedInUserId;
    payload.business.businessContact.createdOn = nowShort;
    payload.business.businessContact.modifiedBy = this.loggedInUserId;
    payload.business.businessContact.modifiedOn = nowShort;
    payload.business.businessContact.isDeleted = false;
    payload.business.businessContact.deletedBy = 0;

    // ---------- businessVerification ----------
    payload.business.businessVerification.createdBy = this.loggedInUserId;
    payload.business.businessVerification.createdOn = nowShort;
    payload.business.businessVerification.modifiedBy = this.loggedInUserId;
    payload.business.businessVerification.modifiedOn = nowShort;
    payload.business.businessVerification.isDeleted = false;
    payload.business.businessVerification.deletedBy = 0;

    // ---------- businessSocialMedia ----------
    payload.business.businessSocialMedia.createdBy = this.loggedInUserId;
    payload.business.businessSocialMedia.createdOn = nowShort;
    payload.business.businessSocialMedia.modifiedBy = this.loggedInUserId;
    payload.business.businessSocialMedia.modifiedOn = nowShort;
    payload.business.businessSocialMedia.isDeleted = false;
    payload.business.businessSocialMedia.deletedBy = 0;

    // ---------- businessAddress ----------
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

    // ---------- businessWorkingHoursList----------
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
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: day === 7, // Sunday closed
    }));

    // ---------- businessGalleryList ----------
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
        imageUrl: "",
        thumbnailUrl: "",
        caption: "",
        displayOrder: 0,
      },
    ];

    this.registering = true;
    this.businessService.saveBusiness(payload).subscribe(
      (data: any) => {
        this.registering = false;

        this.dialogRef.close();
        this.showNotification("Business Registered Successfully");
        this.router.navigate(["/business/profile"]);
      },
      (error) => {
        this.registering = false;
        this.unauthorizedUser = true;
        setTimeout(() => {
          this.unauthorizedUser = false;
        }, 5000);
      }
    );
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
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
