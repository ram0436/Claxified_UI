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
  OfferingTypeOptionDto,
} from '../../model/Business';
import { OfferingType } from '../../enum/business-offering.enum';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BusinessLoginComponent } from '../business-login/business-login.component';
import { forkJoin, of } from 'rxjs';

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

  // Dropdown for the single "Add Offering" button (lists Product, Service,
  // and every other configured offering type).
  addOfferingMenuOpen: boolean = false;

  // The offering type the user picked from the "Add Offering" dropdown
  // before the (generic) add-offering panel opens. Product/Service picks
  // never set this - they route straight to their own panels.
  addOfferingPresetType: OfferingType | null = null;

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
  offeringFilter: OfferingType | 'all' | null = 'all';
  offeringSearch: string = '';

  availableOfferingTypes: OfferingTypeOptionDto[] = [];
  offeringTypesLoading: boolean = false;

  get isProductFilter(): boolean {
    return Number(this.offeringFilter) === Number(this.OfferingType.Product);
  }

  get isServiceFilter(): boolean {
    return Number(this.offeringFilter) === Number(this.OfferingType.Service);
  }

  get isProductOrServiceFilter(): boolean {
    return this.isProductFilter || this.isServiceFilter;
  }

  addOfferingPanelOpen: boolean = false;
  editingOffering: BusinessOfferingDto | null = null;

  // Offers & Reviews state
  offers: BusinessOfferDto[] = [];
  reviews: BusinessReviewDto[] = [];
  offersLoading: boolean = false;
  reviewsLoading: boolean = false;

  // ---------- Allowed offering types (from business category) ----------
  allowedOfferingTypes: Set<OfferingType> = new Set();

  get hasProductOffering(): boolean {
    return this.availableOfferingTypes.some(
      (t) => Number(t.value) === Number(OfferingType.Product),
    );
  }

  get hasServiceOffering(): boolean {
    return this.availableOfferingTypes.some(
      (t) => Number(t.value) === Number(OfferingType.Service),
    );
  }

  get offeringTypeFilterOptions(): { value: OfferingType; label: string }[] {
    if (!this.allowedOfferingTypes.size) return [];
    return OFFERING_TYPE_OPTIONS.filter((opt) =>
      this.allowedOfferingTypes.has(opt.value),
    );
  }

  get otherOfferingTypeOptions(): OfferingTypeOptionDto[] {
    return this.availableOfferingTypes.filter(
      (t) =>
        Number(t.value) !== Number(this.OfferingType.Product) &&
        Number(t.value) !== Number(this.OfferingType.Service),
    );
  }

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

  moreOfferingMenuOpen: boolean = false;

  private readonly maxVisibleOfferingTabs = 5; // includes "All"

  get visibleOfferingTypeTabs(): {
    value: OfferingType | 'all';
    name: string;
  }[] {
    return this.offeringTypeTabs.slice(0, this.maxVisibleOfferingTabs);
  }

  get overflowOfferingTypeTabs(): {
    value: OfferingType | 'all';
    name: string;
  }[] {
    return this.offeringTypeTabs.slice(this.maxVisibleOfferingTabs);
  }

  get hasOverflowOfferingTabs(): boolean {
    return this.overflowOfferingTypeTabs.length > 0;
  }

  get isMoreTabActive(): boolean {
    return this.overflowOfferingTypeTabs.some((t) =>
      this.isOfferingTypeActive(t.value),
    );
  }

  toggleMoreOfferingMenu(): void {
    this.moreOfferingMenuOpen = !this.moreOfferingMenuOpen;
  }

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
    if (!this.addOfferingMenuOpen && !this.moreOfferingMenuOpen) return;
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.addOfferingMenuOpen = false;
      this.moreOfferingMenuOpen = false;
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

        this.loadOfferingTypes();
        this.loadOffers();
        this.loadReviews();
      },
      () => (this.loading = false),
    );
  }

  loadAllowedOfferingTypes(businessCategoryId: number): void {
    if (!businessCategoryId) {
      this.allowedOfferingTypes = new Set();
      return;
    }

    this.businessService
      .getOfferingTypesByBusinessCategory(businessCategoryId)
      .subscribe(
        (data) => {
          this.allowedOfferingTypes = new Set(
            (data || []).map((t) => t.value as OfferingType),
          );
        },
        () => (this.allowedOfferingTypes = new Set()),
      );
  }

  // ================== Add Offering dropdown ==================

  toggleAddOfferingMenu(): void {
    this.addOfferingMenuOpen = !this.addOfferingMenuOpen;
  }

  closeAddOfferingMenu(): void {
    this.addOfferingMenuOpen = false;
  }

  /** Handles a pick from the "Add Offering" dropdown and routes it to the
   * right panel: Product -> product panel, Service -> service panel,
   * everything else -> the generic offering panel, pre-set to that type. */
  selectAddOfferingType(type: OfferingType, event?: Event): void {
    event?.stopPropagation();
    this.addOfferingMenuOpen = false;

    if (Number(type) === Number(this.OfferingType.Product)) {
      this.addProduct();
    } else if (Number(type) === Number(this.OfferingType.Service)) {
      this.addService();
    } else {
      this.addOffering(type);
    }
  }

  getOfferingTypeIcon(type: OfferingType): string {
    switch (Number(type)) {
      case Number(this.OfferingType.Product):
        return 'inventory_2';
      case Number(this.OfferingType.Service):
        return 'design_services';
      case Number(this.OfferingType.Course):
        return 'school';
      case Number(this.OfferingType.MedicalService):
        return 'medical_services';
      default:
        return 'category';
    }
  }

  // ================== Offering type tabs ==================

  /** "All" plus every offering type configured for this business category,
   * used to render the offering-type tab strip. */
  get offeringTypeTabs(): { value: OfferingType | 'all'; name: string }[] {
    return [
      { value: 'all' as const, name: 'All' },
      ...this.availableOfferingTypes.map((t) => ({
        value: t.value,
        name: t.name,
      })),
    ];
  }

  selectOfferingFilter(filter: OfferingType | 'all', event?: Event): void {
    event?.stopPropagation();
    this.moreOfferingMenuOpen = false;
    if (this.offeringFilter === filter) return;
    this.offeringFilter = filter;
  }

  selectSubCategoryTab(id: number): void {
    if (this.selectedSubCategoryId === id) return;
    this.selectedSubCategoryId = id;
    this.loadAllOfferings();
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

  // ================== Offering Types ==================

  loadOfferingTypes(): void {
    if (!this.business?.businessCategoryId) return;

    this.offeringTypesLoading = true;
    this.availableOfferingTypes = [];

    this.businessService
      .getOfferingTypesByBusinessCategory(this.business.businessCategoryId)
      .subscribe(
        (types) => {
          this.availableOfferingTypes = types || [];
          this.offeringTypesLoading = false;
          this.offeringFilter = 'all';
          // Every offering type is loaded together so the tab strip can
          // show an accurate count next to each tab.
          this.loadAllOfferings();
        },
        () => {
          this.availableOfferingTypes = [];
          this.offeringTypesLoading = false;
        },
      );
  }

  loadAllOfferings(): void {
    if (!this.business?.id) return;

    this.catalogLoading = true;
    this.offeringsLoading = true;
    this.catalogItems = [];
    this.offerings = [];

    const hasProduct = this.availableOfferingTypes.some(
      (t) => Number(t.value) === Number(OfferingType.Product),
    );
    const hasService = this.availableOfferingTypes.some(
      (t) => Number(t.value) === Number(OfferingType.Service),
    );
    const hasOther = this.availableOfferingTypes.some(
      (t) =>
        Number(t.value) !== Number(OfferingType.Product) &&
        Number(t.value) !== Number(OfferingType.Service),
    );

    forkJoin({
      products: hasProduct
        ? this.businessService.getBusinessProducts(this.business.id)
        : of([]),
      services: hasService
        ? this.businessService.getBusinessServices(this.business.id)
        : of([]),
      offerings: hasOther
        ? this.businessService.getBusinessOfferingsByBusinessId(
            this.business.id,
            this.selectedSubCategoryId,
            null,
          )
        : of([]),
    }).subscribe(
      ({ products, services, offerings }) => {
        this.rawProducts = products || [];
        this.rawServices = services || [];
        this.catalogItems = [
          ...this.rawProducts.map((p) => this.mapProductToCatalogItem(p)),
          ...this.rawServices.map((s) => this.mapServiceToCatalogItem(s)),
        ];
        this.offerings = offerings || [];
        this.catalogLoading = false;
        this.offeringsLoading = false;
      },
      () => {
        this.catalogItems = [];
        this.offerings = [];
        this.catalogLoading = false;
        this.offeringsLoading = false;
      },
    );
  }

  // ================== Products (catalog) ==================

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
    this.loadAllOfferings();
  }

  onServiceSaved(): void {
    this.closeAddServicePanel();
    this.loadAllOfferings();
  }

  viewCatalogItem(item: CatalogItem): void {
    if (item.type === 'product') {
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

  // ================== Offerings (generic types: Course, MedicalService, etc.) ==================

  /** Offerings/catalog items narrowed by sub-category + search only (not by
   * offering-type tab) - the base set the tab counts and the type filter
   * both draw from. */
  private get searchedCatalogItems(): CatalogItem[] {
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

  private get searchedOfferings(): BusinessOfferingDto[] {
    const term = this.offeringSearch.trim().toLowerCase();
    return this.offerings.filter(
      (item) => !term || item.name.toLowerCase().includes(term),
    );
  }

  get filteredOfferings(): BusinessOfferingDto[] {
    const items = this.searchedOfferings;
    if (this.offeringFilter === 'all') return items;
    return items.filter(
      (item) => Number(item.offeringType) === Number(this.offeringFilter),
    );
  }

  get filteredCatalogItems(): CatalogItem[] {
    const items = this.searchedCatalogItems;
    if (this.offeringFilter === 'all') return items;

    const wantType: 'product' | 'service' | null = this.isProductFilter
      ? 'product'
      : this.isServiceFilter
        ? 'service'
        : null;

    if (!wantType) return [];
    return items.filter((item) => item.type === wantType);
  }

  /** Count of listings for a given offering-type tab (or 'all'), respecting
   * the current sub-category and search filters but not the tab itself -
   * this is what's rendered as the badge on each tab. */
  getOfferingTypeCount(value: OfferingType | 'all'): number {
    if (value === 'all') {
      return this.searchedCatalogItems.length + this.searchedOfferings.length;
    }
    if (Number(value) === Number(this.OfferingType.Product)) {
      return this.searchedCatalogItems.filter((i) => i.type === 'product')
        .length;
    }
    if (Number(value) === Number(this.OfferingType.Service)) {
      return this.searchedCatalogItems.filter((i) => i.type === 'service')
        .length;
    }
    return this.searchedOfferings.filter(
      (o) => Number(o.offeringType) === Number(value),
    ).length;
  }

  get catalogHeading(): string {
    if (this.offeringFilter === OfferingType.Product) return 'Products';
    if (this.offeringFilter === OfferingType.Service) return 'Services';
    return 'Offerings';
  }

  get currentFilterLabel(): string {
    if (this.offeringFilter === 'all') return 'Offerings';
    const match = this.availableOfferingTypes.find(
      (t) => Number(t.value) === Number(this.offeringFilter),
    );
    return match?.name || 'Offerings';
  }

  getOfferingTypeLabel(type: OfferingType): string {
    const match = this.availableOfferingTypes.find(
      (t) => Number(t.value) === Number(type),
    );
    return match?.name || 'Offering';
  }

  addOffering(type?: OfferingType): void {
    this.editingOffering = null;
    this.addOfferingPresetType = type ?? null;
    this.addOfferingPanelOpen = true;
  }

  editOffering(item: BusinessOfferingDto): void {
    this.editingOffering = { ...item };
    this.addOfferingPresetType = item.offeringType;
    this.addOfferingPanelOpen = true;
  }

  isOfferingTypeActive(value: OfferingType | 'all'): boolean {
    if (value === 'all') return this.offeringFilter === 'all';
    return Number(this.offeringFilter) === Number(value);
  }

  viewOffering(item: BusinessOfferingDto): void {
    if (this.isOwner && !this.viewingAsPublic) {
      this.editOffering(item);
    }
  }

  closeAddOfferingPanel(): void {
    this.addOfferingPanelOpen = false;
    this.editingOffering = null;
    this.addOfferingPresetType = null;
  }

  onOfferingSaved(): void {
    this.closeAddOfferingPanel();
    this.loadAllOfferings();
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

  get isOtherOfferingFilter(): boolean {
    // true for 'all' minus product/service is handled separately;
    // this is specifically "a concrete non-product/non-service type is selected"
    return this.offeringFilter !== 'all' && !this.isProductOrServiceFilter;
  }

  get showCatalogSection(): boolean {
    // Product/Service grid should show for 'all' or when explicitly filtered to Product/Service
    return this.offeringFilter === 'all' || this.isProductOrServiceFilter;
  }

  get showGenericOfferingsSection(): boolean {
    // Generic offerings (Course, MedicalService, Event, etc.) should show for 'all'
    // OR when the selected filter is anything other than Product/Service.
    return this.offeringFilter === 'all' || this.isOtherOfferingFilter;
  }

  get isOfferingsSectionLoading(): boolean {
    return this.catalogLoading || this.offeringsLoading;
  }

  get visibleCatalogItems(): CatalogItem[] {
    return this.showCatalogSection ? this.filteredCatalogItems : [];
  }

  get visibleOfferingItems(): BusinessOfferingDto[] {
    return this.showGenericOfferingsSection ? this.filteredOfferings : [];
  }

  get hasAnyOfferingResults(): boolean {
    return (
      this.visibleCatalogItems.length > 0 ||
      this.visibleOfferingItems.length > 0
    );
  }

  get emptyOfferingsMessage(): string {
    if (this.offeringSearch) return 'No results match your search.';
    if (this.isProductFilter) return 'No products listed yet.';
    if (this.isServiceFilter) return 'No services listed yet.';
    if (this.isOtherOfferingFilter) {
      return `No ${this.currentFilterLabel.toLowerCase()} listed yet.`;
    }
    return 'No products or services listed yet.';
  }
}
