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

  @Output() deleted = new EventEmitter<number>();

  showDeleteConfirm: boolean = false;
  deleting: boolean = false;

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

  requestDeleteBusiness(): void {
    this.showDeleteConfirm = true;
  }

  cancelDeleteBusiness(): void {
    this.showDeleteConfirm = false;
  }

  confirmDeleteBusiness(): void {
    this.deleting = true;
    this.businessService.deleteBusiness(this.business.id).subscribe(
      () => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.showNotification("Business deleted successfully");
        this.deleted.emit(this.business.id);
        this.close.emit();
        this.router.navigate(["/business/profile"]);
      },
      () => {
        this.deleting = false;
        this.showNotification(
          "Something went wrong while deleting. Please try again."
        );
      }
    );
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
    // Category changed — the previously selected sub-category id no longer
    // belongs to this category, so clear it to avoid sending a stale/mismatched
    // sub-category id + name pair in the update payload.
    this.business.businessSubCategoryId = 0;
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

    const now = new Date().toISOString();

    // ---------- Resolve dropdown IDs to names too (API wants BOTH id and name) ----------
    const categoryName =
      this.businessCategories.find(
        (c) => c.id === this.business.businessCategoryId
      )?.name || "";
    const subCategoryName =
      this.businessSubCategories.find(
        (s) => s.id === this.business.businessSubCategoryId
      )?.name || "";
    const typeName =
      this.businessTypes.find((t) => t.id === this.business.businessTypeId)
        ?.name || "";
    const sellerTypeName =
      this.sellerTypes.find((s) => s.id === this.business.sellerTypeId)?.name ||
      "";

    // ---------- Gallery ----------
    const galleryEntries = this.cardsCount
      .map((url, index) => ({ url, id: this.galleryIds[index] }))
      .filter((item) => item.url !== "");

    const businessGalleryDtoList =
      galleryEntries.length > 0
        ? galleryEntries.map((item, index) => ({
            id: item.id,
            businessId: this.business.id,
            imageUrl: item.url,
            thumbnailUrl: item.url,
            caption: "",
            displayOrder: index,
          }))
        : [
            {
              id: 0,
              businessId: this.business.id,
              imageUrl: "",
              thumbnailUrl: "",
              caption: "",
              displayOrder: 0,
            },
          ];

    // ---------- Build the exact payload shape the API expects ----------
    const payload = {
      id: this.business.id || 0,
      userId: this.userId,
      businessName: this.business.businessName || "",
      businessCategoryId: this.business.businessCategoryId || 0,
      businessCategory: categoryName,
      businessSubCategoryId: this.business.businessSubCategoryId || 0,
      businessSubCategory: subCategoryName,
      businessTypeId: this.business.businessTypeId || 0,
      businessType: typeName,
      sellerTypeId: this.business.sellerTypeId || 0,
      sellerType: sellerTypeName,
      tabRefGUID: this.tabRefGuid || this.business.tabRefGUID || "",
      description: this.business.description || "",
      logoUrl: this.business.logoUrl || "",
      coverImageUrl: this.business.coverImageUrl || "",
      establishedYear: this.business.establishedYear || 0,
      website: this.business.website || "",
      status: this.business.status ?? 1,

      businessVerificationDto: {
        id: this.business.businessVerification.id || 0,
        businessId: this.business.id || 0,
        isGSTVerified: this.business.businessVerification.isGSTVerified || 0,
        isPANVerified: this.business.businessVerification.isPANVerified || 0,
        isAadhaarVerified:
          this.business.businessVerification.isAadhaarVerified || 0,
        isEmailVerified:
          this.business.businessVerification.isEmailVerified || 0,
        isMobileVerified:
          this.business.businessVerification.isMobileVerified || 0,
        isBusinessVerified:
          this.business.businessVerification.isBusinessVerified || false,
        verificationDate: now,
        verificationRemarks:
          this.business.businessVerification.verificationRemarks || "",
        verifiedBy: this.business.businessVerification.verifiedBy || 0,
      },

      businessContactDto: {
        id: this.business.businessContact.id || 0,
        businessId: this.business.id || 0,
        contactPerson: this.business.businessContact.contactPerson || "",
        mobile: this.business.businessContact.mobile || "",
        alternateMobile: this.business.businessContact.alternateMobile || "",
        email: this.business.businessContact.email || "",
        whatsApp: this.business.businessContact.whatsApp || "",
      },

      businessAddressDto: {
        id: this.business.businessAddress.id || 0,
        businessId: this.business.id || 0,
        country: this.business.businessAddress.country || "",
        state: this.business.businessAddress.state || "",
        city: this.business.businessAddress.city || "",
        area: this.business.businessAddress.area || "",
        address: this.business.businessAddress.address || "",
        pincode: this.business.businessAddress.pincode || "",
        isPrimary: this.business.businessAddress.isPrimary ?? true,
        googleMapURL: this.business.businessAddress.googleMapURL || "",
      },

      businessSocialMediaDto: {
        id: this.business.businessSocialMedia.id || 0,
        businessId: this.business.id || 0,
        facebook: this.business.businessSocialMedia.facebook || "",
        instagram: this.business.businessSocialMedia.instagram || "",
        linkedIn: this.business.businessSocialMedia.linkedIn || "",
        youTube: this.business.businessSocialMedia.youTube || "",
        twitter: this.business.businessSocialMedia.twitter || "",
      },

      businessWorkingHoursDtoList: this.business.businessWorkingHoursList.map(
        (wh) => ({
          id: wh.id || 0,
          businessId: this.business.id,
          dayOfWeek: wh.dayOfWeek,
          openTime: wh.openTime || "",
          closeTime: wh.closeTime || "",
          isClosed: wh.isClosed,
        })
      ),

      businessGalleryDtoList,
    };

    this.saving = true;

    // console.log("Business Update Payload:", JSON.stringify(payload, null, 2));

    this.businessService.updateBusiness(payload).subscribe(
      () => {
        this.saving = false;
        this.showNotification("Business profile saved successfully");
        this.saved.emit(this.tabRefGuid || this.business.tabRefGUID);

        this.businessService.notifyBusinessUpdated(
          this.tabRefGuid || this.business.tabRefGUID,
          this.business.businessName,
          this.business.logoUrl
        );
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
