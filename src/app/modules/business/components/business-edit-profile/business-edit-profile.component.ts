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

    // Reuse a per-user business draft GUID the same way add-post reuses "guid"
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
    this.business.businessSubCategoryId = null;
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
    formData.append("files", files[0]);
    this.logoUploading = true;
    this.businessService.uploadLogo(formData).subscribe(
      (data: any) => {
        this.logoUploading = false;
        this.business.logoUrl = Array.isArray(data) ? data[0] : data;
      },
      () => (this.logoUploading = false)
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
    formData.append("files", files[0]);
    this.coverUploading = true;
    this.businessService.uploadCoverImage(formData).subscribe(
      (data: any) => {
        this.coverUploading = false;
        this.business.coverImageUrl = Array.isArray(data) ? data[0] : data;
      },
      () => (this.coverUploading = false)
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

    this.business.userId = this.userId;
    this.business.tabRefGUID = this.tabRefGUID;
    this.business.createdBy = this.business.createdBy || this.userId;
    (this.business as any).modifiedBy = this.userId;
    (this.business as any).modifiedOn = new Date().toISOString().slice(0, 23);
    if (!(this.business as any).createdOn) {
      (this.business as any).createdOn = new Date().toISOString().slice(0, 23);
    }

    this.business.businessGalleryList = this.cardsCount
      .filter((url) => url !== "")
      .map((url, index) => ({
        id: 0,
        businessId: this.business.id,
        imageUrl: url,
        thumbnailUrl: url,
        caption: "",
        displayOrder: index,
      }));

    this.business.businessContact.businessId = this.business.id;
    this.business.businessAddress.businessId = this.business.id;
    this.business.businessSocialMedia.businessId = this.business.id;

    this.saving = true;
    this.businessService.saveBusiness(this.business).subscribe(
      () => {
        this.saving = false;
        this.showNotification("Business profile saved successfully");
        this.router.navigateByUrl("/business/profile");
      },
      () => {
        this.saving = false;
        this.showNotification(
          "Something went wrong while saving. Please try again."
        );
      }
    );
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 4000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }
}
