import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../service/business.service';
import {
  BusinessListItem,
  BusinessViewDto,
  BusinessProductDto,
  BusinessServiceDto,
  BusinessOfferDto,
  BusinessReviewDto,
  BusinessOfferingDto,
  OFFERING_TYPE_OPTIONS,
} from '../../model/Business';
import { OfferingType } from '../../enum/business-offering.enum';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BusinessLoginComponent } from '../business-login/business-login.component';
import { forkJoin } from 'rxjs';

interface CatalogItem {
  id: number;
  type: 'product' | 'service';
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
  subCategoryId: number;
}

@Component({
  selector: 'app-business-profile',
  templateUrl: './business-profile.component.html',
  styleUrls: ['./business-profile.component.css'],
})
export class BusinessProfileComponent implements OnInit {
  dialogRef!: MatDialogRef<BusinessLoginComponent>;
  mode: 'list' | 'detail' = 'list';
  loading: boolean = true;

  businesses: BusinessListItem[] = [];
  business: BusinessViewDto | null = null;

  offeringFilterOpen: boolean = false;

  activeTab:
    | 'overview'
    | 'offerings'
    | 'hours'
    | 'gallery'
    | 'offers'
    | 'reviews' = 'overview';
  tabRefGuid: string = '';

  skeletonItems = [1, 2, 3, 4, 5, 6];

  // Expose the enum to the template
  OfferingType = OfferingType;

  // ---------- Sub-category tabs ----------
  selectedSubCategoryId: number | null = null;

  get subCategoryTabs(): { id: number; name: string }[] {
    const ids = this.business?.businessSubCategoryIds || [];
    const names = this.business?.businessSubCategory || [];
    return ids.map((id, i) => ({ id, name: names[i] || `Category ${id}` }));
  }

  selectSubCategoryTab(id: number): void {
    if (this.selectedSubCategoryId === id) return;
    this.selectedSubCategoryId = id;

    this.loadOfferings();
    if (this.offeringFilter === this.OfferingType.ProductAndService) {
      this.loadCatalogItems();
    }
  }

  // ---------- Products & Services (catalog) state ----------
  catalogItems: CatalogItem[] = [];
  catalogLoading: boolean = false;
  private rawProducts: BusinessProductDto[] = [];
  private rawServices: BusinessServiceDto[] = [];

  addProductPanelOpen: boolean = false;
  editingProduct: BusinessProductDto | null = null;

  addServicePanelOpen: boolean = false;
  editingService: BusinessServiceDto | null = null;

  quickViewOpen: boolean = false;
  quickViewProduct: BusinessProductDto | null = null;

  quickViewServiceOpen: boolean = false;
  quickViewService: BusinessServiceDto | null = null;

  private readonly pricingTypeDisplayMap: { [key: string]: string } = {
    FixedPrice: 'Fixed Price',
    StartingFrom: 'Starting From',
    PriceRange: 'Price Range',
    Hourly: 'Hourly',
    Daily: 'Daily',
    CustomQuote: 'Custom Quote',
  };

  private readonly priceUnitMap: { [key: string]: string } = {
    FixedPrice: '',
    StartingFrom: 'Starting',
    PriceRange: 'Range',
    Hourly: '/hr',
    Daily: '/day',
    CustomQuote: 'Quote',
  };

  // ---------- Offerings state ----------
  offerings: BusinessOfferingDto[] = [];
  offeringsLoading: boolean = false;
  offeringFilter: OfferingType | 'all' = 'all';
  offeringSearch: string = '';
  offeringTypeFilterOptions = OFFERING_TYPE_OPTIONS;

  addOfferingPanelOpen: boolean = false;
  editingOffering: BusinessOfferingDto | null = null;

  // Offers & Reviews state
  offers: BusinessOfferDto[] = [];
  reviews: BusinessReviewDto[] = [];
  offersLoading: boolean = false;
  reviewsLoading: boolean = false;

  addOfferPanelOpen: boolean = false;
  editingOffer: BusinessOfferDto | null = null;

  addReviewPanelOpen: boolean = false;
  editingReview: BusinessReviewDto | null = null;

  replyingToReview: BusinessReviewDto | null = null;
  replyText: string = '';

  private readonly avatarPalette: string[] = [
    '#0d475c',
    '#e75462',
    '#2f8f9d',
    '#f2a154',
    '#6a4c93',
    '#3c3241',
  ];

  private readonly dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  editPanelOpen: boolean = false;

  lightboxOpen: boolean = false;
  lightboxSrc: string = '';
  lightboxCaption: string = '';

  viewingAsPublic: boolean = false;

  openLightbox(src?: string, caption?: string) {
    if (!src) return;
    this.lightboxSrc = src;
    this.lightboxCaption = caption || '';
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxSrc = '';
    this.lightboxCaption = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.lightboxOpen) {
      this.closeLightbox();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClickForOfferingFilter(event: MouseEvent): void {
    if (!this.offeringFilterOpen) return;
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.offeringFilterOpen = false;
    }
  }

  constructor(
    private businessService: BusinessService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private elRef: ElementRef,
  ) {}

  getYearsInBusiness(establishedYear: number): number {
    return Math.max(1, new Date().getFullYear() - establishedYear);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const guid = params.get('tabRefGuid');

      if (guid) {
        this.mode = 'detail';
        this.tabRefGuid = guid;
        this.loadBusinessDetail(guid);
      } else {
        this.mode = 'list';
        this.loadUserBusinesses();
      }
    });
  }

  get businessSubCategoryNames(): string {
    if (!this.business?.businessSubCategory?.length) {
      return '';
    }

    return this.business.businessSubCategory
      .filter((name) => !!name && name.trim())
      .join(', ');
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
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'business-login-dialog-container',
      autoFocus: false,
    });

    this.dialogRef.afterClosed().subscribe(() => {});
  }

  loadUserBusinesses() {
    const userId = Number(localStorage.getItem('id'));
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
      () => (this.loading = false),
    );
  }

  get isOwner(): boolean {
    if (!this.business) return false;
    const loggedInUserId = Number(localStorage.getItem('id'));
    const ownerUserId = Number((this.business as any).userId);
    return !!loggedInUserId && !!ownerUserId && loggedInUserId === ownerUserId;
  }

  openBusiness(item: BusinessListItem) {
    this.router.navigate(['/business/profile', item.businessId]);
  }

  loadBusinessDetail(tabRefGuid: string) {
    this.loading = true;

    this.businessService.getBusinessByGuid(tabRefGuid).subscribe(
      (data) => {
        this.business = data;
        this.loading = false;

        const ids = data?.businessSubCategoryIds || [];
        this.selectedSubCategoryId = ids.length > 0 ? ids[0] : null;

        this.loadOfferings();
        this.loadOffers();
        this.loadReviews();
      },
      () => (this.loading = false),
    );
  }

  toggleOfferingFilterDropdown(): void {
    this.offeringFilterOpen = !this.offeringFilterOpen;
  }

  closeOfferingFilterDropdown(): void {
    this.offeringFilterOpen = false;
  }

  selectOfferingFilter(filter: OfferingType | 'all'): void {
    this.setOfferingFilter(filter);
    this.offeringFilterOpen = false;

    if (filter === this.OfferingType.ProductAndService) {
      this.loadCatalogItems();
    }
  }

  setTab(
    tab: 'overview' | 'offerings' | 'hours' | 'gallery' | 'offers' | 'reviews',
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
    this.router.navigateByUrl('/business/profile');
  }

  get coverImageSrc(): string {
    return this.business?.coverImageUrl?.trim() || '';
  }

  get logoImageSrc(): string {
    return this.business?.logoUrl?.trim() || '';
  }

  get fullAddress(): string {
    const addr = this.business?.businessAddressDto;
    if (!addr) return '';
    return [addr.area, addr.city, addr.state, addr.country, addr.pincode]
      .filter((v) => !!v)
      .join(', ');
  }

  get isBusinessVerified(): boolean {
    return this.business?.businessVerificationDto?.isBusinessVerified === 1;
  }

  get verificationItems(): { label: string; verified: boolean }[] {
    const v = this.business?.businessVerificationDto;
    if (!v) return [];
    return [
      { label: 'GST', verified: v.isGSTVerified === 1 },
      { label: 'PAN', verified: v.isPANVerified === 1 },
      { label: 'Aadhaar', verified: v.isAadhaarVerified === 1 },
      { label: 'Email', verified: v.isEmailVerified === 1 },
      { label: 'Mobile', verified: v.isMobileVerified === 1 },
      { label: 'Business', verified: v.isBusinessVerified === 1 },
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
      { key: 'facebook', label: 'Facebook', color: '#1877F2' },
      { key: 'instagram', label: 'Instagram', color: '#C13584' },
      { key: 'linkedIn', label: 'LinkedIn', color: '#0A66C2' },
      { key: 'youTube', label: 'YouTube', color: '#FF0000' },
      { key: 'twitter', label: 'Twitter / X', color: '#111111' },
    ];
    return map.filter((m) => !!s[m.key]).map((m) => ({ ...m, url: s[m.key] }));
  }

  get workingHours(): { day: string; isClosed: boolean; hours: string }[] {
    const list = this.business?.businessWorkingHoursDtoList || [];
    return [...list]
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map((d) => ({
        day: this.dayNames[d.dayOfWeek] || '-',
        isClosed: d.isClosed,
        hours: d.isClosed
          ? 'Closed'
          : `${this.formatTime(d.openTime)} - ${this.formatTime(d.closeTime)}`,
      }));
  }

  get galleryItems() {
    return [...(this.business?.businessGalleryDtoList || [])].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );
  }

  formatTime(time?: string): string {
    if (!time) return '-';
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${period}`;
  }

  getInitials(name?: string | null): string {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  avatarGradient(name?: string | null): string {
    const str = name || '?';
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
      `Are you sure you want to delete "${item.businessName}"?`,
    );

    if (!confirmDelete) return;

    this.businessService.deleteBusiness(Number(item.businessId)).subscribe(
      () => {
        this.businesses = this.businesses.filter(
          (b) => b.businessId !== item.businessId,
        );
      },
      (error) => {
        alert('Failed to delete business');
      },
    );
  }

  // ================== Products & Services (catalog) ==================

  loadCatalogItems(): void {
    if (!this.business?.id) return;
    this.catalogLoading = true;
    this.catalogItems = [];

    const products$ = this.businessService.getBusinessProducts(
      this.business.id,
    );
    const services$ = this.businessService.getBusinessServices(
      this.business.id,
    );

    forkJoin({
      products: products$,
      services: services$,
    }).subscribe(
      (result) => {
        this.rawProducts = result.products || [];
        this.rawServices = result.services || [];

        const productItems = this.rawProducts.map((p) =>
          this.mapProductToCatalogItem(p),
        );

        const serviceItems = this.rawServices.map((s) =>
          this.mapServiceToCatalogItem(s),
        );

        this.catalogItems = [...productItems, ...serviceItems];
        this.catalogLoading = false;
      },
      (error) => {
        this.catalogItems = [];
        this.catalogLoading = false;
      },
    );
  }

  private mapProductToCatalogItem(p: BusinessProductDto): CatalogItem {
    const primaryImage =
      p.images?.find((img) => img.isPrimary) || p.images?.[0];

    return {
      id: p.id,
      type: 'product',
      name: p.name,
      category: '',
      price: p.price,
      discountPercentage: p.discountPercentage || 0,
      priceOnRequest: p.priceOnRequest === 'Yes',
      priceUnit: p.priceUnit || '',
      imageUrl: primaryImage?.imageUrl || '',
      subCategoryId: p.productSubCategoryId,
    };
  }

  private mapServiceToCatalogItem(s: BusinessServiceDto): CatalogItem {
    const primaryImage: any =
      (s as any).images?.find((img: any) => img.isPrimary) ||
      (s as any).images?.[0];

    const displayPrice = s.minimumPrice || 0;
    const priceOnRequest = s.pricingType === 'CustomQuote' || false;

    return {
      id: s.id,
      type: 'service',
      name: s.serviceName,
      category: '',
      price: displayPrice,
      discountPercentage: 0,
      priceOnRequest: priceOnRequest,
      priceUnit: this.getServicePriceUnit(s.pricingType),
      imageUrl: primaryImage?.imageUrl || '',
      minimumPrice: s.minimumPrice,
      maximumPrice: s.maximumPrice,
      pricingType: s.pricingType,
      pricingTypeDisplay:
        this.pricingTypeDisplayMap[s.pricingType] || s.pricingType,
      subCategoryId: s.serviceSubCategoryId,
    };
  }

  private getServicePriceUnit(pricingType: string): string {
    return this.priceUnitMap[pricingType] || '';
  }

  discountedPrice(item: CatalogItem): number {
    if (!item.discountPercentage) return item.price;
    return Math.round(
      item.price - (item.price * item.discountPercentage) / 100,
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

  editProduct(item: CatalogItem): void {
    const product = this.rawProducts.find((p) => p.id === item.id);
    if (product) {
      this.editingProduct = product;
      this.addProductPanelOpen = true;
    }
  }

  editService(item: CatalogItem): void {
    const service = this.rawServices.find((s) => s.id === item.id);
    if (service) {
      this.editingService = service;
      this.addServicePanelOpen = true;
    }
  }

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
    if (item.type === 'product') {
      this.editProduct(item);
    } else {
      this.editService(item);
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
    this.router.navigate(['/business/product', id], {
      state: { isOwner },
    });
  }

  viewFullServiceDetails(): void {
    if (!this.quickViewService) return;
    const id = this.quickViewService.id;
    const isOwner = this.isOwner;
    this.closeServiceQuickView();
    this.router.navigate(['/business/service', id], {
      state: { isOwner },
    });
  }

  // ================== Offerings ==================

  loadOfferings(): void {
    if (!this.business?.id) return;
    this.offeringsLoading = true;

    this.businessService
      .getBusinessOfferingsByBusinessId(this.business.id)
      .subscribe(
        (data) => {
          this.offerings = data || [];
          this.offeringsLoading = false;
        },
        () => {
          this.offerings = [];
          this.offeringsLoading = false;
        },
      );
  }

  get filteredOfferings(): BusinessOfferingDto[] {
    const term = this.offeringSearch.trim().toLowerCase();

    return this.offerings.filter((item) => {
      const matchesFilter =
        this.offeringFilter === 'all' ||
        item.offeringType === this.offeringFilter;

      const matchesSubCategory =
        this.selectedSubCategoryId === null ||
        item.subCategoryId === this.selectedSubCategoryId;

      const matchesSearch = !term || item.name.toLowerCase().includes(term);

      return matchesFilter && matchesSubCategory && matchesSearch;
    });
  }

  get filteredCatalogItems(): CatalogItem[] {
    const term = this.offeringSearch.trim().toLowerCase();

    return this.catalogItems.filter((item) => {
      const matchesSubCategory =
        this.selectedSubCategoryId === null ||
        item.subCategoryId === this.selectedSubCategoryId;

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term);

      return matchesSubCategory && matchesSearch;
    });
  }

  setOfferingFilter(filter: OfferingType | 'all'): void {
    this.offeringFilter = filter;
  }

  getOfferingTypeLabel(type: OfferingType): string {
    return (
      OFFERING_TYPE_OPTIONS.find((o) => o.value === type)?.label || 'Offering'
    );
  }

  get currentFilterLabel(): string {
    if (this.offeringFilter === 'all') return 'All Offerings';
    return this.getOfferingTypeLabel(this.offeringFilter);
  }

  addOffering(): void {
    this.editingOffering = null;
    this.addOfferingPanelOpen = true;
  }

  editOffering(item: BusinessOfferingDto): void {
    this.editingOffering = { ...item };
    this.addOfferingPanelOpen = true;
  }

  viewOffering(item: BusinessOfferingDto): void {
    if (this.isOwner && !this.viewingAsPublic) {
      this.editOffering(item);
    }
  }

  closeAddOfferingPanel(): void {
    this.addOfferingPanelOpen = false;
    this.editingOffering = null;
  }

  onOfferingSaved(): void {
    this.closeAddOfferingPanel();
    this.loadOfferings();
  }

  // ================== Offers ==================

  loadOffers(): void {
    if (!this.business?.id) return;
    this.offersLoading = true;

    this.businessService.getBusinessOffers(this.business.id).subscribe(
      (data) => {
        this.offers = data || [];
        this.offersLoading = false;
      },
      (error) => {
        this.offers = [];
        this.offersLoading = false;
      },
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
    if (confirm('Are you sure you want to delete this offer?')) {
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

  // ================== Reviews ==================

  loadReviews(): void {
    if (!this.business?.id) return;
    this.reviewsLoading = true;

    this.businessService.getBusinessReviews(this.business.id).subscribe(
      (data) => {
        this.reviews = data || [];
        this.reviewsLoading = false;
      },
      (error) => {
        this.reviews = [];
        this.reviewsLoading = false;
      },
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
    this.replyText = review.businessReply || '';
    const reply = prompt('Enter your reply:', review.businessReply || '');
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
