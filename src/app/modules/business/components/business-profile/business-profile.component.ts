// business-profile.component.ts
import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BusinessService } from "../../service/business.service";
import {
  BusinessListItem,
  BusinessViewDto,
  BusinessProductDto,
  BusinessServiceDto,
  BusinessOfferDto,
  BusinessReviewDto,
} from "../../model/Business";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BusinessLoginComponent } from "../business-login/business-login.component";
import { forkJoin } from "rxjs";

interface CatalogItem {
  id: number;
  type: "product" | "service";
  name: string;
  category?: string;
  price: number;
  discountPercentage: number;
  priceOnRequest: boolean;
  priceUnit: string;
  imageUrl: string;
  minimumPrice?: number;
  maximumPrice?: number;
  pricingType?: string;
  pricingTypeDisplay?: string;
}

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

  activeTab:
    | "overview"
    | "products"
    | "hours"
    | "gallery"
    | "offers"
    | "reviews" = "overview";
  tabRefGuid: string = "";

  skeletonItems = [1, 2, 3, 4, 5, 6];

  // Products & Services state
  catalogFilter: "all" | "products" | "services" = "all";
  catalogSearch: string = "";
  catalogLoading: boolean = false;
  private catalogItems: CatalogItem[] = [];

  // Offers & Reviews state
  offers: BusinessOfferDto[] = [];
  reviews: BusinessReviewDto[] = [];
  offersLoading: boolean = false;
  reviewsLoading: boolean = false;

  // Add offer state
  addOfferPanelOpen: boolean = false;
  editingOffer: BusinessOfferDto | null = null;

  // Add review state
  addReviewPanelOpen: boolean = false;
  editingReview: BusinessReviewDto | null = null;

  // Reply to review state
  replyingToReview: BusinessReviewDto | null = null;
  replyText: string = "";

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

  viewingAsPublic: boolean = false;

  addProductPanelOpen: boolean = false;
  editingProduct: BusinessProductDto | null = null;

  addServicePanelOpen: boolean = false;
  editingService: BusinessServiceDto | null = null;

  quickViewOpen: boolean = false;
  quickViewProduct: BusinessProductDto | null = null;

  // Store raw data for both products and services
  private rawProducts: BusinessProductDto[] = [];
  private rawServices: BusinessServiceDto[] = [];

  // Service quick view
  quickViewServiceOpen: boolean = false;
  quickViewService: BusinessServiceDto | null = null;

  // Pricing type display mapping
  private readonly pricingTypeDisplayMap: { [key: string]: string } = {
    FixedPrice: "Fixed Price",
    StartingFrom: "Starting From",
    PriceRange: "Price Range",
    Hourly: "Hourly",
    Daily: "Daily",
    CustomQuote: "Custom Quote",
  };

  private readonly priceUnitMap: { [key: string]: string } = {
    FixedPrice: "",
    StartingFrom: "Starting",
    PriceRange: "Range",
    Hourly: "/hr",
    Daily: "/day",
    CustomQuote: "Quote",
  };

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

  getYearsInBusiness(establishedYear: number): number {
    return Math.max(1, new Date().getFullYear() - establishedYear);
  }

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

  get businessSubCategoryNames(): string {
    if (!this.business?.businessSubCategory?.length) {
      return "";
    }

    return this.business.businessSubCategory
      .filter((name) => !!name && name.trim())
      .join(", ");
  }

  get businessSubCategories(): number[] {
    return this.business?.businessSubCategoryIds || [];
  }

  toggleViewAsPublic(): void {
    this.viewingAsPublic = !this.viewingAsPublic;
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
        this.loadCatalogItems();
        this.loadOffers();
        this.loadReviews();
      },
      () => (this.loading = false)
    );
  }

  setTab(
    tab: "overview" | "products" | "hours" | "gallery" | "offers" | "reviews"
  ) {
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

  advertiseProfile(): void {}

  openBusinessDashboard(): void {}

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
    event.stopPropagation();

    const confirmDelete = confirm(
      `Are you sure you want to delete "${item.businessName}"?`
    );

    if (!confirmDelete) return;

    this.businessService.deleteBusiness(Number(item.businessId)).subscribe(
      () => {
        this.businesses = this.businesses.filter(
          (b) => b.businessId !== item.businessId
        );
      },
      (error) => {
        // console.error("Delete failed", error);
        alert("Failed to delete business");
      }
    );
  }

  // ---------- Products & Services ----------

  loadCatalogItems(): void {
    if (!this.business?.id) return;
    this.catalogLoading = true;
    this.catalogItems = [];

    const products$ = this.businessService.getBusinessProducts(
      this.business.id
    );
    const services$ = this.businessService.getBusinessServices(
      this.business.id
    );

    forkJoin({
      products: products$,
      services: services$,
    }).subscribe(
      (result) => {
        this.rawProducts = result.products || [];
        this.rawServices = result.services || [];

        const productItems = this.rawProducts.map((p) =>
          this.mapProductToCatalogItem(p)
        );

        const serviceItems = this.rawServices.map((s) =>
          this.mapServiceToCatalogItem(s)
        );

        this.catalogItems = [...productItems, ...serviceItems];
        this.catalogLoading = false;
      },
      (error) => {
        // console.error("Error loading catalog items:", error);
        this.catalogItems = [];
        this.catalogLoading = false;
      }
    );
  }

  private mapProductToCatalogItem(p: BusinessProductDto): CatalogItem {
    const primaryImage =
      p.images?.find((img) => img.isPrimary) || p.images?.[0];

    return {
      id: p.id,
      type: "product",
      name: p.name,
      category: "",
      price: p.price,
      discountPercentage: p.discountPercentage || 0,
      priceOnRequest: p.priceOnRequest === "Yes",
      priceUnit: p.priceUnit || "",
      imageUrl: primaryImage?.imageUrl || "",
    };
  }

  private mapServiceToCatalogItem(s: BusinessServiceDto): CatalogItem {
    const primaryImage =
      s.images?.find((img) => img.isPrimary) || s.images?.[0];

    const displayPrice = s.minimumPrice || 0;
    const priceOnRequest = s.pricingType === "CustomQuote" || false;

    return {
      id: s.id,
      type: "service",
      name: s.serviceName,
      category: "",
      price: displayPrice,
      discountPercentage: 0,
      priceOnRequest: priceOnRequest,
      priceUnit: this.getServicePriceUnit(s.pricingType),
      imageUrl: primaryImage?.imageUrl || "",
      minimumPrice: s.minimumPrice,
      maximumPrice: s.maximumPrice,
      pricingType: s.pricingType,
      pricingTypeDisplay:
        this.pricingTypeDisplayMap[s.pricingType] || s.pricingType,
    };
  }

  private getServicePriceUnit(pricingType: string): string {
    return this.priceUnitMap[pricingType] || "";
  }

  setCatalogFilter(filter: "all" | "products" | "services") {
    this.catalogFilter = filter;
  }

  get filteredCatalogItems(): CatalogItem[] {
    const term = this.catalogSearch.trim().toLowerCase();

    return this.catalogItems.filter((item) => {
      const matchesFilter =
        this.catalogFilter === "all" ||
        (this.catalogFilter === "products" && item.type === "product") ||
        (this.catalogFilter === "services" && item.type === "service");

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.category || "").toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }

  discountedPrice(item: CatalogItem): number {
    if (!item.discountPercentage) return item.price;
    return Math.round(
      item.price - (item.price * item.discountPercentage) / 100
    );
  }

  addProduct(): void {
    this.editingProduct = null;
    this.addProductPanelOpen = true;
  }

  addService(): void {
    this.editingService = null;
    this.addServicePanelOpen = true;
  }

  editProduct(item: CatalogItem): void {}

  closeAddProductPanel(): void {
    this.addProductPanelOpen = false;
    this.editingProduct = null;
  }

  closeAddServicePanel(): void {
    this.addServicePanelOpen = false;
    this.editingService = null;
  }

  onProductSaved(): void {
    this.closeAddProductPanel();
    this.loadCatalogItems();
  }

  onServiceSaved(): void {
    this.closeAddServicePanel();
    this.loadCatalogItems();
  }

  viewCatalogItem(item: CatalogItem): void {
    if (item.type === "product") {
      const product = this.rawProducts.find((p) => p.id === item.id);
      if (product) {
        this.quickViewProduct = product;
        this.quickViewOpen = true;
      }
    } else {
      const service = this.rawServices.find((s) => s.id === item.id);
      if (service) {
        this.quickViewService = service;
        this.quickViewServiceOpen = true;
      }
    }
  }

  closeQuickView(): void {
    this.quickViewOpen = false;
    this.quickViewProduct = null;
  }

  closeServiceQuickView(): void {
    this.quickViewServiceOpen = false;
    this.quickViewService = null;
  }

  viewFullProductDetails(): void {
    if (!this.quickViewProduct) return;
    const id = this.quickViewProduct.id;
    const isOwner = this.isOwner;
    this.closeQuickView();
    this.router.navigate(["/business/product", id], {
      state: { isOwner },
    });
  }

  viewFullServiceDetails(): void {
    if (!this.quickViewService) return;
    const id = this.quickViewService.id;
    const isOwner = this.isOwner;
    this.closeServiceQuickView();
    this.router.navigate(["/business/service", id], {
      state: { isOwner },
    });
  }

  // ---------- Offers ----------

  loadOffers(): void {
    if (!this.business?.id) return;
    this.offersLoading = true;

    this.businessService.getBusinessOffers(this.business.id).subscribe(
      (data) => {
        this.offers = data || [];
        this.offersLoading = false;
      },
      (error) => {
        // console.error("Error loading offers:", error);
        this.offers = [];
        this.offersLoading = false;
      }
    );
  }

  addOffer(): void {
    this.editingOffer = null;
    this.addOfferPanelOpen = true;
  }

  editOffer(offer: BusinessOfferDto): void {
    this.editingOffer = { ...offer };
    this.addOfferPanelOpen = true;
  }

  closeAddOfferPanel(): void {
    this.addOfferPanelOpen = false;
    this.editingOffer = null;
  }

  onOfferSaved(): void {
    this.closeAddOfferPanel();
    this.loadOffers();
  }

  deleteOffer(offerId: number, event: Event): void {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this offer?")) {
      this.loadOffers();
    }
  }

  isOfferActive(offer: BusinessOfferDto): boolean {
    if (!offer.isActive) return false;
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    return now >= startDate && now <= endDate;
  }

  getDaysLeft(offer: BusinessOfferDto): number {
    const now = new Date();
    const endDate = new Date(offer.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // ---------- Reviews ----------

  loadReviews(): void {
    if (!this.business?.id) return;
    this.reviewsLoading = true;

    this.businessService.getBusinessReviews(this.business.id).subscribe(
      (data) => {
        this.reviews = data || [];
        this.reviewsLoading = false;
      },
      (error) => {
        // console.error("Error loading reviews:", error);
        this.reviews = [];
        this.reviewsLoading = false;
      }
    );
  }

  addReview(): void {
    this.editingReview = null;
    this.addReviewPanelOpen = true;
  }

  closeAddReviewPanel(): void {
    this.addReviewPanelOpen = false;
    this.editingReview = null;
  }

  onReviewSaved(): void {
    this.closeAddReviewPanel();
    this.loadReviews();
  }

  replyToReview(review: BusinessReviewDto): void {
    this.replyingToReview = review;
    this.replyText = review.businessReply || "";
    const reply = prompt("Enter your reply:", review.businessReply || "");
    if (reply !== null) {
      review.businessReply = reply;
      review.businessReplyDate = new Date().toISOString();
      this.loadReviews();
    }
  }

  getStarArray(rating: number): number[] {
    return Array(Math.min(5, Math.floor(rating))).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(Math.min(5, 5 - Math.floor(rating))).fill(0);
  }
}
