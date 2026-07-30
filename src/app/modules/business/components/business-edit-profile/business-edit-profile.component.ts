import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { BusinessService } from "../../service/business.service";
import {
  Business,
  BusinessWorkingHours,
  BusinessViewDto,
} from "../../model/Business";
import { CommonService } from "src/app/shared/service/common.service";

type SectionId =
  | "basic"
  | "about"
  | "contact"
  | "address"
  | "social"
  | "hours"
  | "gallery";

interface EditSection {
  id: SectionId;
  label: string;
  icon: string;
  required: boolean;
}

@Component({
  selector: "app-business-edit-profile",
  templateUrl: "./business-edit-profile.component.html",
  styleUrls: ["./business-edit-profile.component.css"],
})
export class BusinessEditProfileComponent implements OnInit, OnChanges {
  @Input() tabRefGuid: string = "";
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

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

  cardsCount: any[] = new Array(10).fill("");
  galleryIds: number[] = new Array(10).fill(0);
  firstImageUploaded: boolean = false;
  galleryProgress: boolean = false;

  logoUploading: boolean = false;
  coverUploading: boolean = false;

  saving: boolean = false;
  loading: boolean = true;
  userId: number = 0;

  activeSection: SectionId = "basic";

  sections: EditSection[] = [
    { id: "basic", label: "Basic Details", icon: "storefront", required: true },
    {
      id: "about",
      label: "About Business",
      icon: "description",
      required: true,
    },
    { id: "contact", label: "Contact Details", icon: "call", required: true },
    { id: "address", label: "Address", icon: "location_on", required: true },
    { id: "social", label: "Social Media", icon: "share", required: false },
    { id: "hours", label: "Working Hours", icon: "schedule", required: false },
    { id: "gallery", label: "Gallery", icon: "photo_library", required: false },
  ];

  postOffices: any[] = [];

  constructor(
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem("id"));

    this.cardsCount = new Array(10).fill("");
    this.galleryIds = new Array(10).fill(0);

    this.loading = true;
    this.loadDropdownData(() => {
      if (this.tabRefGuid) {
        this.loadExistingBusiness(this.tabRefGuid);
      } else {
        this.ensureWorkingHoursDefaults();
        this.loading = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Allows reopening the panel for a different business without destroying the component
    if (changes["tabRefGuid"] && !changes["tabRefGuid"].firstChange) {
      this.ngOnInit();
    }
  }

  setSection(id: SectionId) {
    this.activeSection = id;
  }

  dismiss() {
    this.close.emit();
  }

  viewPublicProfile(): void {
    if (!this.tabRefGuid) {
      this.showNotification("Save your profile first to get a public link");
      return;
    }
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/business/profile", this.tabRefGuid])
    );
    window.open(url, "_blank");
  }

  loadDropdownData(onLoaded: () => void) {
    let pending = 3;
    const done = () => {
      pending--;
      if (pending === 0) onLoaded();
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

  onCategoryChange() {
    this.businessSubCategories = [];
    if (this.business.businessCategoryId) {
      this.businessService
        .getBusinessSubCategories(this.business.businessCategoryId)
        .subscribe((data: any) => {
          this.businessSubCategories = data;
        });
    }
  }

  getAddress(event: any) {
    const pincode = event.target.value;
    if (pincode.length === 6) {
      this.commonService.getAddress(pincode).subscribe((data: any) => {
        if (data[0].PostOffice != null) {
          const address = data[0].PostOffice[0];
          this.business.businessAddress.state = address.State;
          this.business.businessAddress.city = address.District;
          this.business.businessAddress.country = address.Country || "India";
          this.postOffices = data[0].PostOffice;
          if (this.postOffices.length > 1) {
            this.business.businessAddress.area = this.postOffices[0].Name;
          } else {
            this.business.businessAddress.area = address.Name;
          }
        }
      });
    }
  }

  allowOnlyNumbersPincode(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, "");
    this.business.businessAddress.pincode = event.target.value;
  }

  loadExistingBusiness(tabRefGuid: string) {
    this.businessService.getBusinessByGuid(tabRefGuid).subscribe(
      (dto: BusinessViewDto) => {
        if (!dto) {
          this.ensureWorkingHoursDefaults();
          this.loading = false;
          return;
        }

        this.business = new Business();

        // ---------- Top-level ----------
        this.business.id = dto.id;
        this.business.tabRefGUID = dto.tabRefGUID;
        this.business.businessName = dto.businessName;
        this.business.description = dto.description;
        this.business.logoUrl = dto.logoUrl;
        this.business.coverImageUrl = dto.coverImageUrl;
        this.business.establishedYear = dto.establishedYear;
        this.business.website = dto.website;
        this.business.status = dto.status;

        // Resolve category/type/seller IDs by matching names against dropdown lists
        const matchedCategory = this.businessCategories.find(
          (c) => c.name === dto.businessCategory
        );
        this.business.businessCategoryId = matchedCategory
          ? matchedCategory.id
          : 0;

        const matchedType = this.businessTypes.find(
          (t) => t.name === dto.businessType
        );
        this.business.businessTypeId = matchedType ? matchedType.id : 0;

        const matchedSeller = this.sellerTypes.find(
          (s) => s.name === dto.sellerType
        );
        this.business.sellerTypeId = matchedSeller ? matchedSeller.id : 0;

        if (this.business.businessCategoryId) {
          this.businessService
            .getBusinessSubCategories(this.business.businessCategoryId)
            .subscribe((subs: any) => {
              this.businessSubCategories = subs;
              const matchedSub = subs.find(
                (s: any) => s.name === dto.businessSubCategory
              );
              this.business.businessSubCategoryId = matchedSub
                ? matchedSub.id
                : 0;
            });
        }

        // ---------- Contact ----------
        if (dto.businessContactDto) {
          this.business.businessContact.id = dto.businessContactDto.id || 0;
          this.business.businessContact.contactPerson =
            dto.businessContactDto.contactPerson || "";
          this.business.businessContact.mobile =
            dto.businessContactDto.mobile || "";
          this.business.businessContact.alternateMobile =
            dto.businessContactDto.alternateMobile || "";
          this.business.businessContact.email =
            dto.businessContactDto.email || "";
          this.business.businessContact.whatsApp =
            dto.businessContactDto.whatsApp || "";
        }

        // ---------- Address ----------
        if (dto.businessAddressDto) {
          this.business.businessAddress.id = dto.businessAddressDto.id || 0;
          this.business.businessAddress.country =
            dto.businessAddressDto.country || "";
          this.business.businessAddress.state =
            dto.businessAddressDto.state || "";
          this.business.businessAddress.city =
            dto.businessAddressDto.city || "";
          this.business.businessAddress.area =
            dto.businessAddressDto.area || "";
          this.business.businessAddress.address =
            dto.businessAddressDto.address || "";
          this.business.businessAddress.pincode =
            dto.businessAddressDto.pincode || "";
          this.business.businessAddress.isPrimary =
            !!dto.businessAddressDto.isPrimary;
          this.business.businessAddress.googleMapURL =
            dto.businessAddressDto.googleMapURL || "";
        }

        // ---------- Social Media ----------
        if (dto.businessSocialMediaDto) {
          this.business.businessSocialMedia.id =
            dto.businessSocialMediaDto.id || 0;
          this.business.businessSocialMedia.facebook =
            dto.businessSocialMediaDto.facebook || "";
          this.business.businessSocialMedia.instagram =
            dto.businessSocialMediaDto.instagram || "";
          this.business.businessSocialMedia.linkedIn =
            dto.businessSocialMediaDto.linkedIn || "";
          this.business.businessSocialMedia.youTube =
            dto.businessSocialMediaDto.youTube || "";
          this.business.businessSocialMedia.twitter =
            dto.businessSocialMediaDto.twitter || "";
        }

        // ---------- Verification ----------
        if (dto.businessVerificationDto) {
          this.business.businessVerification.id =
            dto.businessVerificationDto.id || 0;
          this.business.businessVerification.isGSTVerified =
            dto.businessVerificationDto.isGSTVerified || 0;
          this.business.businessVerification.isPANVerified =
            dto.businessVerificationDto.isPANVerified || 0;
          this.business.businessVerification.isAadhaarVerified =
            dto.businessVerificationDto.isAadhaarVerified || 0;
          this.business.businessVerification.isEmailVerified =
            dto.businessVerificationDto.isEmailVerified || 0;
          this.business.businessVerification.isMobileVerified =
            dto.businessVerificationDto.isMobileVerified || 0;
          this.business.businessVerification.isBusinessVerified =
            dto.businessVerificationDto.isBusinessVerified === 1;
          this.business.businessVerification.verificationRemarks =
            dto.businessVerificationDto.verificationRemarks || "";
        }

        // ---------- Working Hours ----------
        if (
          dto.businessWorkingHoursDtoList &&
          dto.businessWorkingHoursDtoList.length > 0
        ) {
          const workingHoursList = dto.businessWorkingHoursDtoList;
          this.business.businessWorkingHoursList = this.dayNames.map(
            (_, index) => {
              const wh = new BusinessWorkingHours();
              const match = workingHoursList.find((w) => w.dayOfWeek === index);
              wh.id = match?.id || 0;
              wh.dayOfWeek = index;
              wh.openTime = match?.openTime || "00:00:00";
              wh.closeTime = match?.closeTime || "00:00:00";
              wh.isClosed = match ? match.isClosed : true;
              return wh;
            }
          );
        } else {
          this.ensureWorkingHoursDefaults();
        }

        // ---------- Gallery ----------
        this.cardsCount = new Array(10).fill("");
        this.galleryIds = new Array(10).fill(0);
        this.firstImageUploaded = false;
        if (
          dto.businessGalleryDtoList &&
          dto.businessGalleryDtoList.length > 0
        ) {
          dto.businessGalleryDtoList.forEach((img, index) => {
            if (index < this.cardsCount.length) {
              this.cardsCount[index] = img.imageUrl;
              this.galleryIds[index] = img.id || 0;
            }
          });
          this.firstImageUploaded = true;
        }

        this.loading = false;
      },
      () => {
        this.ensureWorkingHoursDefaults();
        this.loading = false;
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

  // ---------- Logo ----------
  selectLogoFile() {
    this.document.getElementById("logoUpload")?.click();
  }

  uploadLogo(event: any) {
    const files = event.target.files;
    if (!files.length) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    this.logoUploading = true;
    this.businessService.uploadLogo(formData).subscribe(
      (url: string) => {
        this.logoUploading = false;
        this.business.logoUrl = url;
      },
      () => {
        this.logoUploading = false;
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
    formData.append("file", files[0]);
    this.coverUploading = true;
    this.businessService.uploadCoverImage(formData).subscribe(
      (url: string) => {
        this.coverUploading = false;
        this.business.coverImageUrl = url;
      },
      () => {
        this.coverUploading = false;
      }
    );
  }

  // ---------- Gallery ----------
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
            this.galleryIds[j] = 0; // newly uploaded — no existing row id
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
      this.galleryIds[i] = this.galleryIds[i + 1];
    }
    this.cardsCount[this.cardsCount.length - 1] = "";
    this.galleryIds[this.galleryIds.length - 1] = 0;
  }

  // ---------- Save (always PUT / update) ----------
  saveBusinessProfile() {
    if (
      !this.business.businessName ||
      this.business.businessName.trim().length === 0
    ) {
      this.showNotification("Business name is required");
      this.activeSection = "basic";
      return;
    }

    const now = new Date().toISOString().slice(0, 23);

    this.business.userId = this.userId;
    this.business.tabRefGUID = this.tabRefGuid || this.business.tabRefGUID;
    this.business.createdBy = this.business.createdBy || this.userId;
    this.business.createdOn = this.business.createdOn || now;
    this.business.modifiedBy = this.userId;
    this.business.modifiedOn = now;

    this.business.businessGalleryList = this.cardsCount
      .map((url, index) => ({ url, id: this.galleryIds[index] }))
      .filter((item) => item.url !== "")
      .map((item, index) => ({
        createdBy: this.userId,
        createdOn: now,
        modifiedBy: this.userId,
        modifiedOn: now,
        isDeleted: false,
        deletedDate: "",
        deletedBy: 0,
        id: item.id,
        businessId: this.business.id,
        imageUrl: item.url,
        thumbnailUrl: item.url,
        caption: "",
        displayOrder: index,
      }));

    this.business.businessWorkingHoursList =
      this.business.businessWorkingHoursList.map((wh) => ({
        ...wh,
        createdBy: wh.createdBy || this.userId,
        createdOn: wh.createdOn || now,
        modifiedBy: this.userId,
        modifiedOn: now,
        businessId: this.business.id,
      }));

    this.business.businessContact.businessId = this.business.id;
    this.business.businessContact.createdBy =
      this.business.businessContact.createdBy || this.userId;
    this.business.businessContact.createdOn =
      this.business.businessContact.createdOn || now;
    this.business.businessContact.modifiedBy = this.userId;
    this.business.businessContact.modifiedOn = now;

    this.business.businessAddress.businessId = this.business.id;
    this.business.businessAddress.createdBy =
      this.business.businessAddress.createdBy || this.userId;
    this.business.businessAddress.createdOn =
      this.business.businessAddress.createdOn || now;
    this.business.businessAddress.modifiedBy = this.userId;
    this.business.businessAddress.modifiedOn = now;

    this.business.businessSocialMedia.businessId = this.business.id;
    this.business.businessSocialMedia.createdBy =
      this.business.businessSocialMedia.createdBy || this.userId;
    this.business.businessSocialMedia.createdOn =
      this.business.businessSocialMedia.createdOn || now;
    this.business.businessSocialMedia.modifiedBy = this.userId;
    this.business.businessSocialMedia.modifiedOn = now;

    this.business.businessVerification.businessId = this.business.id;
    this.business.businessVerification.createdBy =
      this.business.businessVerification.createdBy || this.userId;
    this.business.businessVerification.createdOn =
      this.business.businessVerification.createdOn || now;
    this.business.businessVerification.modifiedBy = this.userId;
    this.business.businessVerification.modifiedOn = now;

    this.saving = true;

    // console.log("Business ID:", this.business.id);
    // console.log(
    //   "Full Business Payload:",
    //   JSON.stringify(this.business, null, 2)
    // );

    this.businessService
      .updateBusiness(this.business.id, this.business)
      .subscribe(
        () => {
          this.saving = false;
          this.showNotification("Business profile saved successfully");
          this.saved.emit(this.tabRefGuid || this.business.tabRefGUID);
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
