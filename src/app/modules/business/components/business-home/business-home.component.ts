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
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessService } from '../../service/business.service';
import { BusinessDirectoryItem, BusinessOfferDto } from '../../model/Business';
import { BusinessLoginComponent } from '../business-login/business-login.component';
import { CommonService } from 'src/app/shared/service/common.service';

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

  // Search
  searchQuery: string = '';

  // Businesses
  businesses: BusinessDirectoryItem[] = [];
  businessesLoading: boolean = true;
  businessesError: boolean = false;
  private allActiveBusinesses: BusinessDirectoryItem[] = [];

  businessCategories: any[] = [];
  categoriesLoading: boolean = true;
  categoriesError: boolean = false;
  categoryDisplayLimit: number = 10;
  showAllCategories: boolean = false;

  private readonly BUSINESSES_PER_LOAD = 12;
  visibleBusinessesCount: number = this.BUSINESSES_PER_LOAD;
  isLoadingMore: boolean = false;

  // View / sort state
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'relevance' | 'rating' | 'reviews' | 'newest' = 'relevance';

  // Filters
  selectedCategoryIds: Set<number> = new Set();
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

  offers: OfferViewModel[] = [];
  offersLoading: boolean = true;
  offersError: boolean = false;

  private readonly OFFER_SOURCE_BUSINESS_LIMIT = 100;
  private readonly OFFER_DISPLAY_LIMIT = 6;

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

  selectedBusinessTypes: Set<string> = new Set();
  selectedSellerTypes: Set<string> = new Set();

  businessTypeOptions: { value: string; count: number }[] = [];
  sellerTypeOptions: { value: string; count: number }[] = [];

  constructor(
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
    this.fetchCategories();
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

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
  // INFINITE SCROLL (scroll-triggered "server-side style" pagination)
  // =========================================================

  private setupInfiniteScroll(): void {
    if (!this.scrollSentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.intersectionObserver?.disconnect();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          this.triggerLoadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );
    this.intersectionObserver.observe(this.scrollSentinel.nativeElement);
  }

  private triggerLoadMore(): void {
    if (this.isLoadingMore || !this.hasMoreBusinesses) {
      return;
    }
    this.isLoadingMore = true;
    setTimeout(() => {
      this.visibleBusinessesCount += this.BUSINESSES_PER_LOAD;
      this.isLoadingMore = false;
    }, 300);
  }

  private updateBusinessTypeOptions(): void {
    const counts = new Map<string, number>();
    this.allActiveBusinesses.forEach((b: any) => {
      if (!b.businessType) return;
      counts.set(b.businessType, (counts.get(b.businessType) || 0) + 1);
    });
    this.businessTypeOptions = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }

  private updateOfferingTypeOptions(): void {
    const counts = new Map<string, number>();
    this.allActiveBusinesses.forEach((b: any) => {
      if (!b.sellerType) return;
      counts.set(b.sellerType, (counts.get(b.sellerType) || 0) + 1);
    });
    this.sellerTypeOptions = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }

  toggleBusinessTypeFilter(value: string): void {
    this.selectedBusinessTypes.has(value)
      ? this.selectedBusinessTypes.delete(value)
      : this.selectedBusinessTypes.add(value);
    this.onFiltersChanged();
  }

  toggleSellerTypeFilter(value: string): void {
    this.selectedSellerTypes.has(value)
      ? this.selectedSellerTypes.delete(value)
      : this.selectedSellerTypes.add(value);
    this.onFiltersChanged();
  }

  loadMoreBusinesses(): void {
    this.triggerLoadMore();
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.searchQuery = input.value;
      this.resetPagination();
    }
  }

  performSearch(): void {
    this.resetPagination();
    const businessSection = document.getElementById('businesses-section');
    if (businessSection) {
      businessSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private resetPagination(): void {
    this.visibleBusinessesCount = this.BUSINESSES_PER_LOAD;
  }

  // =========================================================
  // FETCH BUSINESSES
  // =========================================================

  fetchBusinesses(): void {
    this.businessesLoading = true;
    this.businessesError = false;
    this.businessService.getBusinessList().subscribe(
      (data: BusinessDirectoryItem[]) => {
        const activeBusinesses = (data || []).filter((b) => b.status !== 0);
        activeBusinesses.forEach((b) => {
          (b as any).rating = Number((4 + Math.random() * 0.8).toFixed(1));
          (b as any).reviewCount = Math.floor(Math.random() * 200) + 20;
          (b as any).establishedYear = 2015 + Math.floor(Math.random() * 10);
        });

        this.allActiveBusinesses = activeBusinesses;
        this.businesses = activeBusinesses;
        this.businessesLoading = false;

        this.fetchOffers(
          activeBusinesses.slice(0, this.OFFER_SOURCE_BUSINESS_LIMIT),
        );
        this.updateCategoryCounts();
        this.updateCityOptions();
        this.updateBusinessTypeOptions();
        this.updateOfferingTypeOptions();

        setTimeout(() => this.setupInfiniteScroll());
      },
      () => {
        this.businessesError = true;
        this.businessesLoading = false;
        this.offersLoading = false;
        this.offersError = true;
      },
    );
  }

  // =========================================================
  // FETCH CATEGORIES (BusinessService, not hardcoded)
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

        this.updateCategoryCounts();
      },
      () => {
        this.categoriesError = true;
        this.categoriesLoading = false;
      },
    );
  }

  private updateCategoryCounts(): void {
    if (!this.businessCategories.length || !this.allActiveBusinesses.length) {
      return;
    }
    this.businessCategories.forEach((category: any) => {
      category.count = this.allActiveBusinesses.filter(
        (b) => b.businessCategoryId === category.id,
      ).length;
    });
  }

  visibleCategoryFilters(): any[] {
    if (this.showAllCategories) {
      return this.businessCategories;
    }
    return this.businessCategories.slice(0, this.categoryDisplayLimit);
  }

  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  private updateCityOptions(): void {
    const counts = new Map<string, number>();
    this.allActiveBusinesses.forEach((b) => {
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
    if (count === undefined || count === null) {
      return 'Loading…';
    }
    if (count === 0) {
      return 'New on Claxified';
    }
    return `${count} ${count === 1 ? 'Business' : 'Businesses'}`;
  }

  // =========================================================
  // FETCH OFFERS (via Business/offers per businessId)
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
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
          }
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
  // FILTERING / SORTING
  // =========================================================

  get filteredBusinesses(): BusinessDirectoryItem[] {
    const q = this.searchQuery.trim().toLowerCase();

    let result = this.allActiveBusinesses.filter((b: any) => {
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
        this.selectedCategoryIds.size > 0 &&
        !this.selectedCategoryIds.has(b.businessCategoryId)
      ) {
        return false;
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

      if (
        this.selectedBusinessTypes.size > 0 &&
        !this.selectedBusinessTypes.has((b as any).businessType)
      ) {
        return false;
      }
      if (
        this.selectedSellerTypes.size > 0 &&
        !this.selectedSellerTypes.has((b as any).sellerType)
      ) {
        return false;
      }

      return true;
    });

    result = this.sortBusinesses(result);
    return result;
  }

  private sortBusinesses(
    list: BusinessDirectoryItem[],
  ): BusinessDirectoryItem[] {
    const sorted = [...list];
    switch (this.sortBy) {
      case 'rating':
        sorted.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        sorted.sort(
          (a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0),
        );
        break;
      case 'newest':
        sorted.sort(
          (a: any, b: any) =>
            (b.establishedYear || 0) - (a.establishedYear || 0),
        );
        break;
      default:
        break; // relevance = server/original order
    }
    return sorted;
  }

  private matchesExperienceBucket(years: number, bucket: string): boolean {
    if (bucket === '0-5') return years < 5;
    if (bucket === '5-10') return years >= 5 && years < 10;
    if (bucket === '10+') return years >= 10;
    return true;
  }

  onSortChange(): void {
    this.resetPagination();
  }

  onFiltersChanged(): void {
    this.resetPagination();
  }

  toggleCategoryFilter(categoryId: number): void {
    if (this.selectedCategoryIds.has(categoryId)) {
      this.selectedCategoryIds.delete(categoryId);
    } else {
      this.selectedCategoryIds.add(categoryId);
    }
    this.onFiltersChanged();
  }

  toggleRatingFilter(value: number): void {
    this.selectedRatingMin = this.selectedRatingMin === value ? null : value;
    this.onFiltersChanged();
  }

  toggleExperienceFilter(value: string): void {
    this.selectedExperience = this.selectedExperience === value ? null : value;
    this.onFiltersChanged();
  }

  toggleVerifiedOnlyFilter(): void {
    this.verifiedOnly = !this.verifiedOnly;
    this.onFiltersChanged();
  }

  getRatingCount(minRating: number): number {
    return this.allActiveBusinesses.filter(
      (b: any) => (b.rating || 0) >= minRating,
    ).length;
  }

  getExperienceCount(bucket: string): number {
    return this.allActiveBusinesses.filter((b: any) =>
      this.matchesExperienceBucket(
        this.getYearsInBusiness(b.establishedYear),
        bucket,
      ),
    ).length;
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedCategoryIds.size > 0 ||
      this.selectedBusinessTypes.size > 0 ||
      this.selectedSellerTypes.size > 0 ||
      !!this.selectedCity ||
      this.selectedRatingMin !== null ||
      !!this.selectedExperience ||
      this.verifiedOnly
    );
  }

  clearAllFilters(): void {
    this.selectedCategoryIds.clear();
    this.selectedBusinessTypes.clear();
    this.selectedSellerTypes.clear();
    this.selectedCity = '';
    this.selectedRatingMin = null;
    this.selectedExperience = null;
    this.verifiedOnly = false;
    this.onFiltersChanged();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  get displayedBusinesses(): BusinessDirectoryItem[] {
    return this.filteredBusinesses.slice(0, this.visibleBusinessesCount);
  }

  get hasMoreBusinesses(): boolean {
    return this.visibleBusinessesCount < this.filteredBusinesses.length;
  }

  // =========================================================
  // FAVORITES (client-side only)
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
    this.router.navigate(['/business/profile', business.tabRefGUID]);
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
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
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
    return b.contactNumber || b.phoneNumber || b.mobileNumber || '';
  }

  getWhatsAppLink(business: BusinessDirectoryItem): string {
    const phone = this.getBusinessPhone(business).replace(/[^\d]/g, '');
    return phone ? `https://wa.me/${phone}` : '';
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
    if (percentMatch) {
      return { value: `${percentMatch[1]}%`, suffix: 'OFF' };
    }
    const flatMatch = title.match(/₹\s*([\d,]+)/);
    if (flatMatch) {
      return { value: `₹${flatMatch[1]}`, suffix: 'OFF' };
    }
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

  formatOfferValidity(endDate: string): string {
    if (!endDate) return '';
    const date = new Date(endDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
