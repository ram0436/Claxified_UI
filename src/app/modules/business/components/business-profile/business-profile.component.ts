import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BusinessService } from "../../service/business.service";
import { BusinessListItem, BusinessViewDto } from "../../model/Business";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BusinessLoginComponent } from "../business-login/business-login.component";

@Component({
  selector: "app-business-profile",
  templateUrl: "./business-profile.component.html",
  styleUrls: ["./business-profile.component.css"],
})
export class BusinessProfileComponent implements OnInit {
  dialogRef!: MatDialogRef<BusinessLoginComponent>;
  mode: "list" | "detail" = "list";
  loading: boolean = true;

  businesses: BusinessListItem[] = [];
  business: BusinessViewDto | null = null;

  activeTab: "overview" | "hours" | "gallery" | "services" = "overview";
  tabRefGuid: string = "";

  skeletonItems = [1, 2, 3, 4, 5, 6];

  private readonly avatarPalette: string[] = [
    "#0d475c",
    "#e75462",
    "#2f8f9d",
    "#f2a154",
    "#6a4c93",
    "#3c3241",
  ];

  private readonly dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  editPanelOpen: boolean = false;

  lightboxOpen: boolean = false;
  lightboxSrc: string = "";
  lightboxCaption: string = "";

  openLightbox(src?: string, caption?: string) {
    if (!src) return;
    this.lightboxSrc = src;
    this.lightboxCaption = caption || "";
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxSrc = "";
    this.lightboxCaption = "";
  }

  @HostListener("document:keydown.escape")
  onEscapeKey() {
    if (this.lightboxOpen) {
      this.closeLightbox();
    }
  }

  constructor(
    private businessService: BusinessService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const guid = params.get("tabRefGuid");

      if (guid) {
        this.mode = "detail";
        this.tabRefGuid = guid;
        this.loadBusinessDetail(guid);
      } else {
        this.mode = "list";
        this.loadUserBusinesses();
      }
    });
  }

  registerNewBusiness() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(BusinessLoginComponent, {
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });

    this.dialogRef.afterClosed().subscribe(() => {});
  }

  loadUserBusinesses() {
    const userId = Number(localStorage.getItem("id"));
    this.loading = true;

    if (!userId) {
      this.loading = false;
      return;
    }

    this.businessService.getUserBusinesses(userId).subscribe(
      (data) => {
        this.businesses = data || [];
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  get isOwner(): boolean {
    if (!this.business) return false;
    const loggedInUserId = Number(localStorage.getItem("id"));
    const ownerUserId = Number((this.business as any).userId);
    return !!loggedInUserId && !!ownerUserId && loggedInUserId === ownerUserId;
  }

  openBusiness(item: BusinessListItem) {
    this.router.navigate(["/business/profile", item.businessId]);
  }

  loadBusinessDetail(tabRefGuid: string) {
    this.loading = true;

    this.businessService.getBusinessByGuid(tabRefGuid).subscribe(
      (data) => {
        this.business = data;
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  setTab(tab: "overview" | "hours" | "gallery" | "services") {
    this.activeTab = tab;
  }

  editProfile() {
    this.editPanelOpen = true;
  }

  closeEditPanel() {
    this.editPanelOpen = false;
  }

  onProfileSaved() {
    this.editPanelOpen = false;
    this.loadBusinessDetail(this.tabRefGuid);
  }

  shareProfile(): void {}

  backToList() {
    this.router.navigateByUrl("/business/profile");
  }

  get coverImageSrc(): string {
    return this.business?.coverImageUrl?.trim() || "";
  }

  get logoImageSrc(): string {
    return this.business?.logoUrl?.trim() || "";
  }

  get fullAddress(): string {
    const addr = this.business?.businessAddressDto;
    if (!addr) return "";
    return [addr.area, addr.city, addr.state, addr.country, addr.pincode]
      .filter((v) => !!v)
      .join(", ");
  }

  get isBusinessVerified(): boolean {
    return this.business?.businessVerificationDto?.isBusinessVerified === 1;
  }

  get verificationItems(): { label: string; verified: boolean }[] {
    const v = this.business?.businessVerificationDto;
    if (!v) return [];
    return [
      { label: "GST", verified: v.isGSTVerified === 1 },
      { label: "PAN", verified: v.isPANVerified === 1 },
      { label: "Aadhaar", verified: v.isAadhaarVerified === 1 },
      { label: "Email", verified: v.isEmailVerified === 1 },
      { label: "Mobile", verified: v.isMobileVerified === 1 },
      { label: "Business", verified: v.isBusinessVerified === 1 },
    ];
  }

  get socialLinks(): {
    key: string;
    label: string;
    color: string;
    url: string;
  }[] {
    const s: any = this.business?.businessSocialMediaDto;
    if (!s) return [];
    const map = [
      { key: "facebook", label: "Facebook", color: "#1877F2" },
      { key: "instagram", label: "Instagram", color: "#C13584" },
      { key: "linkedIn", label: "LinkedIn", color: "#0A66C2" },
      { key: "youTube", label: "YouTube", color: "#FF0000" },
      { key: "twitter", label: "Twitter / X", color: "#111111" },
    ];
    return map.filter((m) => !!s[m.key]).map((m) => ({ ...m, url: s[m.key] }));
  }

  get workingHours(): { day: string; isClosed: boolean; hours: string }[] {
    const list = this.business?.businessWorkingHoursDtoList || [];
    return [...list]
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map((d) => ({
        day: this.dayNames[d.dayOfWeek] || "-",
        isClosed: d.isClosed,
        hours: d.isClosed
          ? "Closed"
          : `${this.formatTime(d.openTime)} - ${this.formatTime(d.closeTime)}`,
      }));
  }

  get galleryItems() {
    return [...(this.business?.businessGalleryDtoList || [])].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  }

  formatTime(time?: string): string {
    if (!time) return "-";
    const [hStr, mStr] = time.split(":");
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${period}`;
  }

  getInitials(name?: string | null): string {
    if (!name || !name.trim()) return "?";
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("");
  }

  avatarGradient(name?: string | null): string {
    const str = name || "?";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % this.avatarPalette.length;
    const c1 = this.avatarPalette[idx];
    const c2 = this.avatarPalette[(idx + 2) % this.avatarPalette.length];
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  }

  deleteBusiness(item: BusinessListItem, event: Event) {
    event.stopPropagation(); // 🚫 prevent card click

    const confirmDelete = confirm(
      `Are you sure you want to delete "${item.businessName}"?`
    );

    if (!confirmDelete) return;

    this.businessService.deleteBusiness(Number(item.businessId)).subscribe(
      () => {
        // remove from UI instantly
        this.businesses = this.businesses.filter(
          (b) => b.businessId !== item.businessId
        );
      },
      (error) => {
        console.error("Delete failed", error);
        alert("Failed to delete business");
      }
    );
  }
}
