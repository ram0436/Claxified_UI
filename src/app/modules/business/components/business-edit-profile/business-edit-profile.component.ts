import { Component, Inject, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { BusinessService } from "../../service/business.service";
import { Business, BusinessWorkingHours } from "../../model/Business";

@Component({
  selector: "app-business-edit-profile",
  templateUrl: "./business-edit-profile.component.html",
  styleUrls: ["./business-edit-profile.component.css"],
})
export class BusinessEditProfileComponent implements OnInit {
  business: Business = new Business();

  businessCategories: any[] = [];
  businessSubCategories: any[] = [];
  businessTypes: any[] = [];
  sellerTypes: any[] = [];

  dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Gallery upload — same pattern as your add-post component
  cardsCount: any[] = new Array(10);
  firstImageUploaded: boolean = false;
  galleryProgress: boolean = false;

  logoUploading: boolean = false;
  coverUploading: boolean = false;

  saving: boolean = false;
  userId: number = 0;
  tabRefGUID: string = "";

  constructor(
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  defaultCoverImage = "../../../../../assets/business-default-cover.jpg";
  defaultLogoImage = "../../../../../assets/business-default-logo.png";

  get coverPreviewSrc(): string {
    return this.business.coverImageUrl
      ? this.business.coverImageUrl
      : this.defaultCoverImage;
  }

  get logoPreviewSrc(): string {
    return this.business.logoUrl
      ? this.business.logoUrl
      : this.defaultLogoImage;
  }

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem("id"));

    this.tabRefGUID =
      localStorage.getItem("businessGuid") || this.generateGuid();
    localStorage.setItem("businessGuid", this.tabRefGUID);

    for (let i = 0; i < this.cardsCount.length; i++) {
      this.cardsCount[i] = "";
    }

    this.loadDropdownData();
    this.loadExistingBusiness();
  }

  generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ---------- Public view ----------
  viewPublicProfile(): void {
    if (!this.business.tabRefGUID) {
      this.showNotification("Save your profile first to get a public link");
      return;
    }
    // opens in a new tab so the edit form stays where it was
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/business/profile", this.business.tabRefGUID])
    );
    window.open(url, "_blank");
  }

  loadDropdownData() {
    this.businessService.getBusinessCategories().subscribe((data: any) => {
      this.businessCategories = data;
    });
    this.businessService.getBusinessTypes().subscribe((data: any) => {
      this.businessTypes = data;
    });
    this.businessService.getSellerTypes().subscribe((data: any) => {
      this.sellerTypes = data;
    });
  }

  onCategoryChange() {
    // this.business.businessSubCategoryId = 0;
    this.businessSubCategories = [];
    if (this.business.businessCategoryId) {
      this.businessService
        .getBusinessSubCategories(this.business.businessCategoryId)
        .subscribe((data: any) => {
          this.businessSubCategories = data;
        });
    }
  }

  loadExistingBusiness() {
    this.businessService.getBusinessByGuid(this.tabRefGUID).subscribe(
      (data: any) => {
        if (data) {
          this.business = Object.assign(new Business(), data);
          if (this.business.businessCategoryId) {
            this.businessService
              .getBusinessSubCategories(this.business.businessCategoryId)
              .subscribe((subs: any) => (this.businessSubCategories = subs));
          }
          this.populateGalleryCards();
        }
        this.ensureWorkingHoursDefaults();
      },
      () => {
        // no existing draft yet — start fresh
        this.ensureWorkingHoursDefaults();
      }
    );
  }

  ensureWorkingHoursDefaults() {
    if (
      !this.business.businessWorkingHoursList ||
      this.business.businessWorkingHoursList.length === 0
    ) {
      this.business.businessWorkingHoursList = this.dayNames.map((_, index) => {
        const wh = new BusinessWorkingHours();
        wh.dayOfWeek = index;
        wh.isClosed = true;
        wh.openTime = "00:00:00";
        wh.closeTime = "00:00:00";
        return wh;
      });
    }
  }

  populateGalleryCards() {
    if (
      this.business.businessGalleryList &&
      this.business.businessGalleryList.length > 0
    ) {
      this.business.businessGalleryList.forEach((img, index) => {
        if (index < this.cardsCount.length) {
          this.cardsCount[index] = img.imageUrl;
        }
      });
      this.firstImageUploaded = true;
    }
  }

  // ---------- Logo ----------
  selectLogoFile() {
    this.document.getElementById("logoUpload")?.click();
  }

  uploadLogo(event: any) {
    const files = event.target.files;
    if (!files.length) return;
    const formData = new FormData();
    formData.append("file", files[0]); // singular, matches Swagger schema
    this.logoUploading = true;
    this.businessService.uploadLogo(formData).subscribe(
      (url: string) => {
        this.logoUploading = false;
        this.business.logoUrl = url;
      },
      (error) => {
        this.logoUploading = false;
        console.error("Logo upload failed:", error);
      }
    );
  }

  // ---------- Cover Image ----------
  selectCoverFile() {
    this.document.getElementById("coverUpload")?.click();
  }

  uploadCoverImage(event: any) {
    const files = event.target.files;
    if (!files.length) return;
    const formData = new FormData();
    formData.append("file", files[0]); // singular, and only ever one file — no loop needed
    this.coverUploading = true;
    this.businessService.uploadCoverImage(formData).subscribe(
      (url: string) => {
        this.coverUploading = false;
        this.business.coverImageUrl = url;
      },
      (error) => {
        this.coverUploading = false;
        console.error("Cover upload failed:", error);
      }
    );
  }

  // ---------- Gallery (same interaction pattern as add-post) ----------
  selectFile() {
    this.document.getElementById("galleryUpload")?.click();
  }

  selectImage(event: any): void {
    const files = event.target.files;
    const formData = new FormData();
    this.galleryProgress = true;
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    this.businessService
      .uploadGalleryImages(formData)
      .subscribe((data: any) => {
        this.galleryProgress = false;
        let dataIndex = 0;
        for (
          let j = 0;
          j < this.cardsCount.length && dataIndex < data.length;
          j++
        ) {
          if (this.cardsCount[j] === "") {
            this.cardsCount[j] = data[dataIndex];
            dataIndex++;
          }
          if (!this.firstImageUploaded) {
            this.firstImageUploaded = true;
          }
        }
      });
  }

  deleteBackgroundImage(index: any): void {
    for (let i = index; i < this.cardsCount.length - 1; i++) {
      this.cardsCount[i] = this.cardsCount[i + 1];
    }
    this.cardsCount[this.cardsCount.length - 1] = "";
  }

  // ---------- Save ----------
  saveBusinessProfile() {
    if (
      !this.business.businessName ||
      this.business.businessName.trim().length === 0
    ) {
      this.showNotification("Business name is required");
      return;
    }

    const now = new Date().toISOString().slice(0, 23);

    this.business.userId = this.userId;
    this.business.tabRefGUID = this.tabRefGUID;
    this.business.createdBy = this.business.createdBy || this.userId;
    this.business.createdOn = this.business.createdOn || now;
    this.business.modifiedBy = this.userId;
    this.business.modifiedOn = now;

    // Gallery — build from cardsCount, stamp audit fields on each item
    this.business.businessGalleryList = this.cardsCount
      .filter((url) => url !== "")
      .map((url, index) => ({
        createdBy: this.userId,
        createdOn: now,
        modifiedBy: this.userId,
        modifiedOn: now,
        isDeleted: false,
        deletedDate: "",
        deletedBy: 0,
        id: 0,
        businessId: this.business.id,
        imageUrl: url,
        thumbnailUrl: url,
        caption: "",
        displayOrder: index,
      }));

    // Working hours — stamp audit fields on each entry
    this.business.businessWorkingHoursList =
      this.business.businessWorkingHoursList.map((wh) => ({
        ...wh,
        createdBy: wh.createdBy || this.userId,
        createdOn: wh.createdOn || now,
        modifiedBy: this.userId,
        modifiedOn: now,
        businessId: this.business.id,
      }));

    // Contact
    this.business.businessContact.businessId = this.business.id;
    this.business.businessContact.createdBy =
      this.business.businessContact.createdBy || this.userId;
    this.business.businessContact.createdOn =
      this.business.businessContact.createdOn || now;
    this.business.businessContact.modifiedBy = this.userId;
    this.business.businessContact.modifiedOn = now;

    // Address
    this.business.businessAddress.businessId = this.business.id;
    this.business.businessAddress.createdBy =
      this.business.businessAddress.createdBy || this.userId;
    this.business.businessAddress.createdOn =
      this.business.businessAddress.createdOn || now;
    this.business.businessAddress.modifiedBy = this.userId;
    this.business.businessAddress.modifiedOn = now;

    // Social Media
    this.business.businessSocialMedia.businessId = this.business.id;
    this.business.businessSocialMedia.createdBy =
      this.business.businessSocialMedia.createdBy || this.userId;
    this.business.businessSocialMedia.createdOn =
      this.business.businessSocialMedia.createdOn || now;
    this.business.businessSocialMedia.modifiedBy = this.userId;
    this.business.businessSocialMedia.modifiedOn = now;

    // Verification — wasn't being sent at all before; include it with safe defaults
    this.business.businessVerification.businessId = this.business.id;
    this.business.businessVerification.createdBy =
      this.business.businessVerification.createdBy || this.userId;
    this.business.businessVerification.createdOn =
      this.business.businessVerification.createdOn || now;
    this.business.businessVerification.modifiedBy = this.userId;
    this.business.businessVerification.modifiedOn = now;

    this.saving = true;
    this.businessService.saveBusiness(this.business).subscribe(
      (response) => {
        this.saving = false;
        this.showNotification("Business profile saved successfully");
        this.router.navigateByUrl("/business/profile");
      },
      (error) => {
        this.saving = false;
        this.showNotification(
          "Something went wrong while saving. Please try again."
        );
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
}
