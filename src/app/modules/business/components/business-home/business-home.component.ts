import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, from, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
} from 'rxjs/operators';
import { BusinessService } from '../../service/business.service';
import { BusinessDirectoryItem, BusinessOfferDto } from '../../model/Business';
import { BusinessLoginComponent } from '../business-login/business-login.component';
import { CommonService } from 'src/app/shared/service/common.service';
import { buildBusinessCommands } from '../../../business/utils/business-url.util';

interface OfferViewModel extends BusinessOfferDto {
  businessName: string;
  icon?: string;
}

interface TrustItem {
  icon: string;
  title: string;
  subtitle: string;
  colorClass: string;
}

interface FilterBucket {
  value: string | number;
  label: string;
}

interface CityOption {
  city: string;
  count: number;
}

@Component({
  selector: 'app-business-home',
  templateUrl: './business-home.component.html',
  styleUrls: ['./business-home.component.css'],
})
export class BusinessHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLDivElement>;
  private intersectionObserver?: IntersectionObserver;

  // ---------- Search ----------
  searchQuery: string = '';
  private searchSubject = new Subject<string>();

  // ---------- Businesses (server-paged, accumulated) ----------
  businesses: BusinessDirectoryItem[] = [];
  businessesLoading: boolean = false; // first-page load only
  businessesRefreshing: boolean = false; // filter change (keeps sidebar visible)
  businessesError: boolean = false;

  totalBusinessCount: number = 0;
  pageIndex: number = 1;
  readonly pageSize: number = 12;
  isLoadingMore: boolean = false;
  hasMoreFromServer: boolean = false;

  // ---------- Categories ----------
  businessCategories: any[] = [];
  categoriesLoading: boolean = true;
  categoriesError: boolean = false;
  categoryDisplayLimit: number = 10;
  showAllCategories: boolean = false;

  // ---------- View / sort ----------
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'relevance' | 'rating' | 'reviews' | 'newest' = 'relevance';

  // ---------- Filters (SINGLE-select for the 3 server filters) ----------
  selectedCategoryId: number | null = null;
  selectedBusinessType: string | null = null;
  selectedSellerType: string | null = null;

  // Client-side only filters
  selectedCity: string = '';
  selectedRatingMin: number | null = null;
  selectedExperience: string | null = null;
  verifiedOnly: boolean = false;
  cityOptions: CityOption[] = [];

  favoriteIds: Set<number> = new Set();

  ratingBuckets: FilterBucket[] = [
    { value: 4.5, label: '4.5 & above' },
    { value: 4.0, label: '4.0 & above' },
    { value: 3.5, label: '3.5 & above' },
  ];

  experienceBuckets: FilterBucket[] = [
    { value: '10+', label: '10+ years' },
    { value: '5-10', label: '5 - 10 years' },
    { value: '0-5', label: 'Under 5 years' },
  ];

  // ---------- Offers ----------
  offers: OfferViewModel[] = [];
  offersLoading: boolean = true;
  offersError: boolean = false;
  private readonly OFFER_SOURCE_BUSINESS_LIMIT = 100;
  private readonly OFFER_DISPLAY_LIMIT = 6;

  // Lookups (label → id) so we can pass ids to the server
  private businessTypeNameToId = new Map<string, number>();
  private sellerTypeNameToId = new Map<string, number>();

  // Business-type & seller-type option lists built from loaded data
  businessTypeOptions: { value: string; count: number }[] = [];
  sellerTypeOptions: { value: string; count: number }[] = [];

  categoryIcons: { [key: string]: string } = {
    'Real Estate': 'business_center',
    'Home Services': 'handyman',
    Education: 'school',
    'Health & Care': 'health_and_safety',
    Automotive: 'directions_car',
    Electronics: 'devices_other',
    'Beauty & Wellness': 'spa',
    'Food & Restaurants': 'restaurant',
    Music: 'music_note',
    Fitness: 'fitness_center',
    Photography: 'photo_camera',
    Legal: 'gavel',
  };

  trustItems: TrustItem[] = [
    {
      icon: 'verified_user',
      title: 'Trusted & Verified',
      subtitle: 'Verified businesses you can trust',
      colorClass: 'c-purple',
    },
    {
      icon: 'sell',
      title: 'Great Deals',
      subtitle: 'Find the best deals near you',
      colorClass: 'c-pink',
    },
    {
      icon: 'shield',
      title: 'Safe & Secure',
      subtitle: 'Your safety is our top priority',
      colorClass: 'c-orange',
    },
    {
      icon: 'support_agent',
      title: '24/7 Support',
      subtitle: "We're here to help you anytime",
      colorClass: 'c-green',
    },
    {
      icon: 'smartphone',
      title: 'Easy to Use',
      subtitle: 'Simple, fast and seamless experience',
      colorClass: 'c-indigo',
    },
  ];

  constructor(
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.loadBusinesses(true);

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q) => {
        this.searchQuery = q;
        // Search is applied client-side (the API doesn't accept a search
        // param yet). No server round-trip needed.
        this.businesses = [...this.businesses];
      });
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  // =========================================================
  // HELPERS
  // =========================================================

  private readonly htmlTagRegex = /<[^>]*>/g;

  stripHtml(value: string | undefined | null): string {
    if (!value) return '';
    const withoutTags = value.replace(this.htmlTagRegex, ' ');
    return withoutTags
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getBusinessDescription(business: BusinessDirectoryItem): string {
    const clean = this.stripHtml((business as any).description);
    return (
      clean ||
      `${business.businessCategory || 'This business'} near you — quality service you can trust.`
    );
  }

  // =========================================================
  // SERVER-SIDE LOADING
  // =========================================================

  /**
   * @param reset true  -> reset to page 1, clear list, load first page
   *              false -> append next page
   */
  loadBusinesses(reset: boolean): void {
    if (reset) {
      this.pageIndex = 1;
      this.businessesError = false;

      if (this.businesses.length === 0) {
        this.businessesLoading = true;
      } else {
        this.businessesRefreshing = true;
      }
    } else {
      if (this.isLoadingMore || !this.hasMoreFromServer) return;
      this.isLoadingMore = true;
    }

    this.businessService
      .getBusinessList({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        businessCategoryId: this.selectedCategoryId,
        businessTypeId: this.selectedBusinessType
          ? (this.businessTypeNameToId.get(this.selectedBusinessType) ?? null)
          : null,
        sellerTypeId: this.selectedSellerType
          ? (this.sellerTypeNameToId.get(this.selectedSellerType) ?? null)
          : null,
      })
      .subscribe(
        (res) => {
          const items = res.items || [];
          const accumulated = reset ? items : this.businesses.concat(items);

          this.businesses = accumulated;
          this.totalBusinessCount = res.totalCount || 0;
          this.hasMoreFromServer = accumulated.length < this.totalBusinessCount;

          this.businessesLoading = false;
          this.businessesRefreshing = false;
          this.isLoadingMore = false;

          // Review stats only for newly fetched batch
          this.loadReviewStats(items);

          // Rebuild type / seller option lists from everything loaded
          this.updateBusinessTypeOptions(accumulated);
          this.updateOfferingTypeOptions(accumulated);

          // Rebuild name → id maps from new items
          this.rebuildNameToIdMaps(items);

          if (reset) {
            this.updateCityOptions(accumulated);
            this.updateCategoryCounts(accumulated);
            this.fetchOffers(
              accumulated.slice(0, this.OFFER_SOURCE_BUSINESS_LIMIT),
            );
          }

          // Re-arm the observer (sentinel may have been re-created)
          setTimeout(() => this.setupInfiniteScroll());
        },
        () => {
          this.businessesError = true;
          this.businessesLoading = false;
          this.businessesRefreshing = false;
          this.isLoadingMore = false;
          this.offersLoading = false;
          this.offersError = true;
        },
      );
  }

  private reload(): void {
    this.loadBusinesses(true);
  }

  private rebuildNameToIdMaps(items: BusinessDirectoryItem[]): void {
    items.forEach((b: any) => {
      if (b.businessType && b.businessTypeId != null) {
        this.businessTypeNameToId.set(b.businessType, b.businessTypeId);
      }
      if (b.sellerType && b.sellerTypeId != null) {
        this.sellerTypeNameToId.set(b.sellerType, b.sellerTypeId);
      }
    });
  }

  // =========================================================
  // INFINITE SCROLL
  // =========================================================

  private setupInfiniteScroll(): void {
    if (!this.scrollSentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.intersectionObserver?.disconnect();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.triggerLoadMore();
        }
      },
      { root: null, rootMargin: '300px', threshold: 0 },
    );
    this.intersectionObserver.observe(this.scrollSentinel.nativeElement);
  }

  private triggerLoadMore(): void {
    if (this.isLoadingMore || !this.hasMoreFromServer) return;
    if (this.businessesLoading || this.businessesRefreshing) return;

    this.pageIndex += 1;
    this.loadBusinesses(false);
  }

  loadMoreBusinesses(): void {
    this.triggerLoadMore();
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) this.searchSubject.next(input.value);
  }

  performSearch(): void {
    this.searchSubject.next(this.searchQuery);
    const businessSection = document.getElementById('businesses-section');
    businessSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = false;
    this.businessService.getBusinessCategories().subscribe(
      (data: any) => {
        this.businessCategories = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name || c.categoryName,
          count: undefined as number | undefined,
        }));
        this.categoriesLoading = false;
        this.updateCategoryCounts(this.businesses);
      },
      () => {
        this.categoriesError = true;
        this.categoriesLoading = false;
      },
    );
  }

  private updateCategoryCounts(items: BusinessDirectoryItem[]): void {
    if (!this.businessCategories.length) return;
    this.businessCategories.forEach((category: any) => {
      category.count = items.filter(
        (b) => b.businessCategoryId === category.id,
      ).length;
    });
  }

  visibleCategoryFilters(): any[] {
    if (this.showAllCategories) return this.businessCategories;
    return this.businessCategories.slice(0, this.categoryDisplayLimit);
  }

  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  private updateCityOptions(items: BusinessDirectoryItem[]): void {
    const counts = new Map<string, number>();
    items.forEach((b) => {
      const city = b.businessAddressDto?.city;
      if (!city) return;
      counts.set(city, (counts.get(city) || 0) + 1);
    });
    this.cityOptions = Array.from(counts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }

  getCategoryCountLabel(category: any): string {
    const count = category?.count;
    if (count === undefined || count === null) return 'Loading…';
    if (count === 0) return 'New on Claxified';
    return `${count} ${count === 1 ? 'Business' : 'Businesses'}`;
  }

  // =========================================================
  // OFFERS
  // =========================================================

  fetchOffers(businesses: BusinessDirectoryItem[]): void {
    this.offersLoading = true;
    this.offersError = false;

    if (!businesses || businesses.length === 0) {
      this.offers = [];
      this.offersLoading = false;
      return;
    }

    const offerRequests = businesses.map((business) =>
      this.businessService
        .getBusinessOffers(business.id)
        .pipe(catchError(() => of([] as BusinessOfferDto[]))),
    );

    forkJoin(offerRequests).subscribe(
      (results: BusinessOfferDto[][]) => {
        const flattened: OfferViewModel[] = [];
        results.forEach((offerList, index) => {
          const business = businesses[index];
          (offerList || [])
            .filter((offer) => offer.isActive && this.isOfferValid(offer))
            .forEach((offer) => {
              flattened.push({
                ...offer,
                businessName: business.businessName,
                icon: this.getOfferIcon(offer.offerType),
              });
            });
        });

        flattened.sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });

        this.offers = flattened.slice(0, this.OFFER_DISPLAY_LIMIT);
        this.offersLoading = false;
      },
      () => {
        this.offersError = true;
        this.offersLoading = false;
      },
    );
  }

  private getOfferIcon(offerType: number): string {
    const iconMap: { [key: number]: string } = {
      1: 'local_offer',
      2: 'discount',
      3: 'card_giftcard',
      4: 'restaurant',
    };
    return iconMap[offerType] || 'local_offer';
  }

  private isOfferValid(offer: BusinessOfferDto): boolean {
    if (!offer.endDate) return true;
    return new Date(offer.endDate).getTime() >= new Date().setHours(0, 0, 0, 0);
  }

  trackByOfferId(_index: number, offer: OfferViewModel): number {
    return offer.id;
  }

  // =========================================================
  // REVIEW STATS
  // =========================================================

  private loadReviewStats(businesses: BusinessDirectoryItem[]): void {
    if (!businesses.length) return;

    from(businesses)
      .pipe(
        mergeMap(
          (b) =>
            this.businessService.getBusinessReviews(b.id).pipe(
              map((res) => ({ b, res })),
              catchError(() => of(null)),
            ),
          4,
        ),
      )
      .subscribe((result) => {
        if (!result) return;
        const { b, res } = result;
        const list: any[] = Array.isArray(res)
          ? res
          : (res as any)?.data || (res as any)?.items || [];

        const count = list.length;
        const total = list.reduce((s, r) => s + (Number(r.rating) || 0), 0);
        (b as any).reviewCount = count;
        (b as any).rating = count ? Number((total / count).toFixed(1)) : 0;
        (b as any).reviewsLoaded = true;
        // Trigger change detection for the visible list
        this.businesses = [...this.businesses];
      });
  }

  hasReviewStats(business: BusinessDirectoryItem): boolean {
    return !!(business as any).reviewsLoaded;
  }

  getRating(business: BusinessDirectoryItem): number {
    return Number((business as any).rating) || 0;
  }

  getReviewCount(business: BusinessDirectoryItem): number {
    return Number((business as any).reviewCount) || 0;
  }

  // =========================================================
  // FILTER HANDLERS (single-select for server filters)
  // =========================================================

  toggleCategoryFilter(categoryId: number): void {
    this.selectedCategoryId =
      this.selectedCategoryId === categoryId ? null : categoryId;
    this.onFiltersChanged();
  }

  toggleBusinessTypeFilter(value: string): void {
    this.selectedBusinessType =
      this.selectedBusinessType === value ? null : value;
    this.onFiltersChanged();
  }

  toggleSellerTypeFilter(value: string): void {
    this.selectedSellerType = this.selectedSellerType === value ? null : value;
    this.onFiltersChanged();
  }

  toggleRatingFilter(value: number): void {
    this.selectedRatingMin = this.selectedRatingMin === value ? null : value;
    this.businesses = [...this.businesses];
  }

  toggleExperienceFilter(value: string): void {
    this.selectedExperience = this.selectedExperience === value ? null : value;
    this.businesses = [...this.businesses];
  }

  toggleVerifiedOnlyFilter(): void {
    this.verifiedOnly = !this.verifiedOnly;
    this.businesses = [...this.businesses];
  }

  /** Server-side filter change → reload page 1. */
  onFiltersChanged(): void {
    this.reload();
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedCategoryId !== null ||
      this.selectedBusinessType !== null ||
      this.selectedSellerType !== null ||
      !!this.selectedCity ||
      this.selectedRatingMin !== null ||
      !!this.selectedExperience ||
      this.verifiedOnly
    );
  }

  clearAllFilters(): void {
    this.selectedCategoryId = null;
    this.selectedBusinessType = null;
    this.selectedSellerType = null;
    this.selectedCity = '';
    this.selectedRatingMin = null;
    this.selectedExperience = null;
    this.verifiedOnly = false;
    this.reload();
  }

  // Popular category tab click — single-select, syncs with sidebar.
  selectCategoryTab(category: any): void {
    this.selectedCategoryId =
      this.selectedCategoryId === category.id ? null : category.id;
    this.reload();
    document
      .getElementById('businesses-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // =========================================================
  // CLIENT-SIDE FILTERS + SORT
  // =========================================================

  get filteredBusinesses(): BusinessDirectoryItem[] {
    const q = this.searchQuery.trim().toLowerCase();

    let result = this.businesses.filter((b: any) => {
      if (q) {
        const name = (b.businessName || '').toLowerCase();
        const category = (b.businessCategory || '').toLowerCase();
        const location = (this.getLocationLabel(b) || '').toLowerCase();
        if (
          !name.includes(q) &&
          !category.includes(q) &&
          !location.includes(q)
        ) {
          return false;
        }
      }

      if (
        this.selectedCity &&
        b.businessAddressDto?.city !== this.selectedCity
      ) {
        return false;
      }

      if (
        this.selectedRatingMin !== null &&
        (b.rating || 0) < this.selectedRatingMin
      ) {
        return false;
      }

      if (this.selectedExperience) {
        const years = this.getYearsInBusiness(b.establishedYear);
        if (!this.matchesExperienceBucket(years, this.selectedExperience)) {
          return false;
        }
      }

      if (this.verifiedOnly && !b.businessVerificationDto?.isBusinessVerified) {
        return false;
      }

      return true;
    });

    switch (this.sortBy) {
      case 'rating':
        result.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        result.sort(
          (a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0),
        );
        break;
      case 'newest':
        result.sort(
          (a: any, b: any) =>
            (b.establishedYear || 0) - (a.establishedYear || 0),
        );
        break;
      default:
        break;
    }
    return result;
  }

  private matchesExperienceBucket(years: number, bucket: string): boolean {
    if (bucket === '0-5') return years < 5;
    if (bucket === '5-10') return years >= 5 && years < 10;
    if (bucket === '10+') return years >= 10;
    return true;
  }

  onSortChange(): void {
    this.businesses = [...this.businesses];
  }

  get displayedBusinesses(): BusinessDirectoryItem[] {
    return this.filteredBusinesses;
  }

  // =========================================================
  // FAVORITES
  // =========================================================

  toggleFavorite(business: BusinessDirectoryItem, event: Event): void {
    event.stopPropagation();
    if (this.favoriteIds.has(business.id)) {
      this.favoriteIds.delete(business.id);
    } else {
      this.favoriteIds.add(business.id);
    }
  }

  isFavorite(business: BusinessDirectoryItem): boolean {
    return this.favoriteIds.has(business.id);
  }

  // =========================================================
  // BUSINESS HELPERS
  // =========================================================

  getYearsInBusiness(establishedYear: number): number {
    if (!establishedYear) return 0;
    return Math.max(1, new Date().getFullYear() - establishedYear);
  }

  viewBusiness(business: BusinessDirectoryItem): void {
    if (!business.tabRefGUID) return;
    const cmds = buildBusinessCommands(business);
    if (cmds) this.router.navigate(cmds);
  }

  trackByBusinessId(_index: number, business: BusinessDirectoryItem): number {
    return business.id;
  }

  getLocationLabel(business: BusinessDirectoryItem): string {
    const addr = business.businessAddressDto;
    if (!addr) return '';
    return [addr.area, addr.city].filter((part) => !!part).join(', ');
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  isOpenNow(business: BusinessDirectoryItem): boolean {
    const hours = business.businessWorkingHoursDtoList;
    if (!hours || hours.length === 0) return true;

    const now = new Date();
    const today = hours.find((h) => h.dayOfWeek === now.getDay());
    if (!today) return true;
    if (today.isClosed) return false;

    const openMinutes = this.toMinutes(today.openTime);
    const closeMinutes = this.toMinutes(today.closeTime);
    if (openMinutes === null || closeMinutes === null) return true;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  }

  private toMinutes(time: string): number | null {
    if (!time) return null;
    const [h, m] = time.split(':').map((v) => parseInt(v, 10));
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  getBusinessPhone(business: BusinessDirectoryItem): string {
    const b = business as any;
    const fromDto =
      b?.businessContactDto?.mobile ||
      b?.businessContactDto?.whatsApp ||
      b?.businessContactDto?.phone;

    if (fromDto) return String(fromDto).trim();

    return (
      b?.contactNumber || b?.phoneNumber || b?.mobileNumber || b?.mobile || ''
    );
  }

  getWhatsAppLink(business: BusinessDirectoryItem): string {
    const b = business as any;
    const wa =
      b?.businessContactDto?.whatsApp ||
      b?.whatsApp ||
      this.getBusinessPhone(business);

    if (!wa) return '';

    let digits = String(wa).replace(/[^\d]/g, '');
    if (digits.length === 10) digits = '91' + digits;
    return digits ? `https://wa.me/${digits}` : '';
  }

  // =========================================================
  // BUSINESS TYPE / SELLER TYPE OPTIONS
  // =========================================================

  private updateBusinessTypeOptions(items: BusinessDirectoryItem[]): void {
    const counts = new Map<string, number>();
    items.forEach((b: any) => {
      if (!b.businessType) return;
      counts.set(b.businessType, (counts.get(b.businessType) || 0) + 1);
      if (b.businessTypeId != null) {
        this.businessTypeNameToId.set(b.businessType, b.businessTypeId);
      }
    });
    this.businessTypeOptions = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }

  private updateOfferingTypeOptions(items: BusinessDirectoryItem[]): void {
    const counts = new Map<string, number>();
    items.forEach((b: any) => {
      if (!b.sellerType) return;
      counts.set(b.sellerType, (counts.get(b.sellerType) || 0) + 1);
      if (b.sellerTypeId != null) {
        this.sellerTypeNameToId.set(b.sellerType, b.sellerTypeId);
      }
    });
    this.sellerTypeOptions = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }

  // =========================================================
  // CATEGORY HELPERS
  // =========================================================

  getCategoryIcon(categoryName: string): string {
    if (!categoryName) return 'category';
    const key = categoryName.toLowerCase();

    if (
      key.includes('real estate') ||
      key.includes('property') ||
      key.includes('construction')
    )
      return 'apartment';
    if (
      key.includes('home service') ||
      key.includes('repair') ||
      key.includes('maintenance') ||
      key.includes('plumb') ||
      key.includes('electric') ||
      key.includes('carpenter')
    )
      return 'handyman';
    if (
      key.includes('education') ||
      key.includes('school') ||
      key.includes('college') ||
      key.includes('coaching') ||
      key.includes('tutor') ||
      key.includes('class')
    )
      return 'school';
    if (
      key.includes('health') ||
      key.includes('care') ||
      key.includes('hospital') ||
      key.includes('clinic') ||
      key.includes('doctor') ||
      key.includes('medical')
    )
      return 'health_and_safety';
    if (
      key.includes('automotive') ||
      key.includes('car') ||
      key.includes('vehicle') ||
      key.includes('auto') ||
      key.includes('bike') ||
      key.includes('garage')
    )
      return 'directions_car';
    if (
      key.includes('electronic') ||
      key.includes('gadget') ||
      key.includes('mobile') ||
      key.includes('computer') ||
      key.includes('appliance')
    )
      return 'devices_other';
    if (
      key.includes('beauty') ||
      key.includes('wellness') ||
      key.includes('spa') ||
      key.includes('salon') ||
      key.includes('parlour') ||
      key.includes('parlor')
    )
      return 'spa';
    if (
      key.includes('food') ||
      key.includes('restaurant') ||
      key.includes('cafe') ||
      key.includes('bakery') ||
      key.includes('catering') ||
      key.includes('hotel')
    )
      return 'restaurant';
    if (key.includes('music') || key.includes('dj') || key.includes('band'))
      return 'music_note';
    if (
      key.includes('fitness') ||
      key.includes('gym') ||
      key.includes('yoga') ||
      key.includes('sport')
    )
      return 'fitness_center';
    if (
      key.includes('photograph') ||
      key.includes('photo') ||
      key.includes('video') ||
      key.includes('studio')
    )
      return 'photo_camera';
    if (
      key.includes('legal') ||
      key.includes('law') ||
      key.includes('advocate') ||
      key.includes('court')
    )
      return 'gavel';
    if (
      key.includes('finance') ||
      key.includes('account') ||
      key.includes('insurance') ||
      key.includes('bank') ||
      key.includes('tax')
    )
      return 'account_balance';
    if (
      key.includes('software') ||
      key.includes('it ') ||
      key.includes('tech') ||
      key.includes('web') ||
      key.includes('app')
    )
      return 'computer';
    if (key.includes('travel') || key.includes('tour') || key.includes('trip'))
      return 'flight';
    if (key.includes('security') || key.includes('guard')) return 'security';
    if (key.includes('clean') || key.includes('housekeeping'))
      return 'cleaning_services';
    if (
      key.includes('market') ||
      key.includes('advertis') ||
      key.includes('brand')
    )
      return 'campaign';
    if (
      key.includes('event') ||
      key.includes('wedding') ||
      key.includes('party')
    )
      return 'celebration';
    if (key.includes('pet') || key.includes('vet') || key.includes('animal'))
      return 'pets';
    if (
      key.includes('fashion') ||
      key.includes('cloth') ||
      key.includes('tailor') ||
      key.includes('boutique')
    )
      return 'checkroom';

    return 'category';
  }

  private readonly categoryColorClasses: string[] = [
    'c-purple',
    'c-pink',
    'c-orange',
    'c-green',
    'c-indigo',
    'c-blue',
    'c-teal',
    'c-red',
  ];

  getCategoryColorClass(categoryName: string): string {
    if (!categoryName) return 'c-neutral';
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.categoryColorClasses.length;
    return this.categoryColorClasses[index];
  }

  navigateToCategory(category: any): void {
    const routeMap: { [key: string]: string } = {
      'Real Estate': 'Properties',
      'Home Services': 'Commercial Services',
      Education: 'Commercial Services',
      'Health & Care': 'Commercial Services',
      Automotive: 'Vehicles',
      Electronics: 'Electronics',
      'Beauty & Wellness': 'Fashion',
      'Food & Restaurants': 'Commercial Services',
    };
    const route = routeMap[category.name] || category.name;
    this.router.navigate([`/${route}/view-posts`], {
      queryParams: { type: route },
    });
  }

  // =========================================================
  // OFFER HELPERS
  // =========================================================

  getOfferBadge(title: string): { value: string; suffix: string } {
    if (!title) return { value: 'OFFER', suffix: '' };
    const percentMatch = title.match(/(\d+)\s*%/);
    if (percentMatch) return { value: `${percentMatch[1]}%`, suffix: 'OFF' };
    const flatMatch = title.match(/₹\s*([\d,]+)/);
    if (flatMatch) return { value: `₹${flatMatch[1]}`, suffix: 'OFF' };
    return { value: 'FREE', suffix: '' };
  }

  openBusinessLoginModal(): void {
    this.dialog.open(BusinessLoginComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'business-login-dialog-container',
      autoFocus: false,
    });
  }

  getBusinessUrl(business: BusinessDirectoryItem): string {
    if (!business.tabRefGUID) return '';
    const cmds = buildBusinessCommands(business);
    if (!cmds) return '';
    const tree = this.router.createUrlTree(cmds);
    return this.router.serializeUrl(tree);
  }

  onBusinessLinkClick(
    event: MouseEvent,
    business: BusinessDirectoryItem,
  ): void {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    this.viewBusiness(business);
  }

  formatOfferValidity(endDate: string): string {
    if (!endDate) return '';
    const date = new Date(endDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private resolveContact(
    business: BusinessDirectoryItem,
    done: () => void,
  ): void {
    if (!business.tabRefGUID) {
      done();
      return;
    }
    this.businessService.getBusinessByGuid(business.tabRefGUID).subscribe(
      (detail: any) => {
        (business as any).businessContactDto = detail?.businessContactDto;
        done();
      },
      () => done(),
    );
  }

  onCallClick(event: Event, business: BusinessDirectoryItem): void {
    event.stopPropagation();
    if (this.getBusinessPhone(business)) return;

    event.preventDefault();
    this.resolveContact(business, () => {
      const phone = this.getBusinessPhone(business);
      if (phone) {
        window.location.href = `tel:${phone}`;
      } else {
        alert('Phone number not available for this business.');
      }
    });
  }

  onWhatsAppClick(event: Event, business: BusinessDirectoryItem): void {
    event.stopPropagation();
    if (this.getWhatsAppLink(business)) return;

    event.preventDefault();
    const win = window.open('', '_blank');
    this.resolveContact(business, () => {
      const link = this.getWhatsAppLink(business);
      if (link && win) {
        win.location.href = link;
      } else {
        win?.close();
        alert('WhatsApp number not available for this business.');
      }
    });
  }

  getRatingCount(minRating: number): number {
    return this.businesses.filter((b: any) => (b.rating || 0) >= minRating)
      .length;
  }

  getExperienceCount(bucket: string): number {
    return this.businesses.filter((b: any) =>
      this.matchesExperienceBucket(
        this.getYearsInBusiness(b.establishedYear),
        bucket,
      ),
    ).length;
  }
}
