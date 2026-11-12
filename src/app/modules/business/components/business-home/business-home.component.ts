import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginComponent } from 'src/app/modules/user/component/login/login.component';
import { forkJoin, from, Observable, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { BusinessService } from '../../service/business.service';
import {
  BusinessDirectoryItem,
  BusinessOfferDto,
  BusinessSearchQuery,
  BusinessSearchResult,
} from '../../model/Business';
import { BusinessLoginComponent } from '../business-login/business-login.component';
import { CommonService } from 'src/app/shared/service/common.service';
import { buildBusinessCommands } from '../../../business/utils/business-url.util';
import { BusinessAnalyticsTracker } from '../../service/business-analytics-tracker.service';
import { BusinessAnalyticsEventType } from '../../model/business-analytics';

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

/** A matching offering shown inside a search result card. */
interface SearchOfferingVM {
  id: number;
  name: string;
  description: string;
  price: number | null;
  businessId: number;
  imageUrls: string[];
}

/**
 * A search hit merged with directory data. `business` is a
 * BusinessDirectoryItem (real one when found in the directory, otherwise a
 * minimal stand-in built from the search response) so the existing
 * view / call / WhatsApp helpers work unchanged.
 */
interface SearchResultVM {
  business: BusinessDirectoryItem;
  location: string;
  score: number;
  offerings: SearchOfferingVM[];
}

type LocationParams = { city?: string; area?: string; pincode?: string };

/** Major Indian cities offered as suggestions (any place can still be typed). */
const INDIAN_CITIES: string[] = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Nashik',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Varanasi',
  'Srinagar',
  'Aurangabad',
  'Dhanbad',
  'Amritsar',
  'Navi Mumbai',
  'Allahabad',
  'Ranchi',
  'Howrah',
  'Coimbatore',
  'Jabalpur',
  'Gwalior',
  'Vijayawada',
  'Jodhpur',
  'Madurai',
  'Raipur',
  'Kota',
  'Chandigarh',
  'Guwahati',
  'Solapur',
  'Hubli',
  'Mysore',
  'Tiruchirappalli',
  'Bareilly',
  'Moradabad',
  'Gurgaon',
  'Noida',
  'Aligarh',
  'Jalandhar',
  'Bhubaneswar',
  'Salem',
  'Warangal',
  'Thiruvananthapuram',
  'Kochi',
  'Kozhikode',
  'Thrissur',
  'Mangalore',
  'Belgaum',
  'Gulbarga',
  'Davanagere',
  'Shimoga',
  'Tumkur',
  'Dehradun',
  'Udaipur',
  'Ajmer',
  'Jamshedpur',
  'Cuttack',
  'Siliguri',
  'Thane',
  'Pimpri-Chinchwad',
  'Guntur',
  'Nellore',
  'Tirupati',
  'Puducherry',
  'Goa',
  'Shimla',
  'Jammu',
  'Ranchi',
  'Gandhinagar',
  'Mohali',
  'Panaji',
  'Imphal',
  'Shillong',
];

/** Alternate spellings / old and new names of the same Indian place. */
const LOCATION_ALIASES: string[][] = [
  ['Bangalore', 'Bengaluru'],
  ['Mumbai', 'Bombay'],
  ['Chennai', 'Madras'],
  ['Kolkata', 'Calcutta'],
  ['Gurgaon', 'Gurugram'],
  ['Pune', 'Poona'],
  ['Kochi', 'Cochin'],
  ['Thiruvananthapuram', 'Trivandrum'],
  ['Mysore', 'Mysuru'],
  ['Mangalore', 'Mangaluru'],
  ['Belgaum', 'Belagavi'],
  ['Gulbarga', 'Kalaburagi'],
  ['Shimoga', 'Shivamogga'],
  ['Hubli', 'Hubballi'],
  ['Tumkur', 'Tumakuru'],
  ['Vadodara', 'Baroda'],
  ['Varanasi', 'Benares', 'Banaras'],
  ['Allahabad', 'Prayagraj'],
  ['Visakhapatnam', 'Vizag'],
  ['Tiruchirappalli', 'Trichy'],
  ['Puducherry', 'Pondicherry'],
  ['Kozhikode', 'Calicut'],
  ['Panaji', 'Panjim'],
];

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
  appliedQuery: string = '';
  searchLocation: string = '';
  appliedLocation: string = '';
  locationSuggestions: string[] = [...new Set(INDIAN_CITIES)].sort();
  private activeLocation: LocationParams = {};

  // ---------- Search results (GET Business/search, accumulated) ----------
  searchResults: SearchResultVM[] = [];
  searchLoading: boolean = false; // first load, nothing on screen yet
  searchRefreshing: boolean = false; // re-search while results are on screen
  searchError: boolean = false;
  searchPageIndex: number = 1;
  readonly searchPageSize: number = 10;
  isLoadingMoreSearch: boolean = false;
  searchHasMore: boolean = false;
  resultsView: 'list' | 'map' = 'list';
  selectedMapResultId: number | null = null;
  mapEmbedUrl: SafeResourceUrl | null = null;
  private searchSub?: Subscription;
  private cityNames = new Set<string>();
  private areaNames = new Set<string>();

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
  sortBy: 'relevance' | 'rating' | 'reviews' | 'newest' | 'name' = 'relevance';

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

  // ---------- Mobile filter drawer ----------
  mobileFiltersOpen = false;

  openMobileFilters(): void {
    this.mobileFiltersOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeMobileFilters(): void {
    this.mobileFiltersOpen = false;
    document.body.style.overflow = '';
  }

  constructor(
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private dialog: MatDialog,
    private tracker: BusinessAnalyticsTracker,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.loadBusinesses(true);
    this.loadWishlist();
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.searchSub?.unsubscribe();
    document.body.style.overflow = '';
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
    if (this.isSearchMode) {
      this.runSearch(true);
    } else {
      this.loadBusinesses(true);
    }
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
    if (this.isSearchMode) {
      if (
        this.isLoadingMoreSearch ||
        !this.searchHasMore ||
        this.searchLoading ||
        this.searchRefreshing
      ) {
        return;
      }
      this.searchPageIndex += 1;
      this.runSearch(false);
      return;
    }
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
    this.searchQuery = (event.target as HTMLInputElement)?.value ?? '';
    this.clearIfSearchBoxesEmptied();
  }

  onLocationInput(event: Event): void {
    this.searchLocation = (event.target as HTMLInputElement)?.value ?? '';
    this.clearIfSearchBoxesEmptied();
  }

  /** Emptying both boxes while a search is showing returns to the directory. */
  private clearIfSearchBoxesEmptied(): void {
    if (
      this.isSearchMode &&
      !this.searchQuery.trim() &&
      !this.searchLocation.trim()
    ) {
      this.clearSearch();
    }
  }

  get isSearchMode(): boolean {
    return !!(this.appliedQuery.trim() || this.appliedLocation.trim());
  }

  performSearch(): void {
    this.appliedQuery = this.searchQuery.trim();
    this.appliedLocation = this.searchLocation.trim();

    if (this.appliedQuery) {
      this.businessService
        .saveSearchHistory(this.appliedQuery)
        .subscribe({ error: () => {} });
    }

    if (!this.isSearchMode) {
      // Both boxes empty -> back to the normal, unfiltered directory.
      this.searchSub?.unsubscribe();
      this.resetSearchState();
      this.resetFilters();
      this.sortBy = 'relevance';
      this.loadBusinesses(true);
    } else {
      this.sortBy = 'relevance';
      this.runSearch(true);
    }

    setTimeout(() => {
      document
        .getElementById('businesses-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.setupInfiniteScroll();
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchLocation = '';
    this.appliedQuery = '';
    this.appliedLocation = '';
    this.searchSub?.unsubscribe();
    this.resetSearchState();
    this.resetFilters();
    this.sortBy = 'relevance';
    this.loadBusinesses(true);
  }

  /** Clears every sidebar filter without reloading (callers reload). */
  private resetFilters(): void {
    this.selectedCategoryId = null;
    this.selectedBusinessType = null;
    this.selectedSellerType = null;
    this.selectedCity = '';
    this.selectedRatingMin = null;
    this.selectedExperience = null;
    this.verifiedOnly = false;
    this.closeMobileFilters();
  }

  private resetSearchState(): void {
    this.searchResults = [];
    this.searchLoading = false;
    this.searchRefreshing = false;
    this.searchError = false;
    this.isLoadingMoreSearch = false;
    this.searchHasMore = false;
    this.selectedMapResultId = null;
    this.mapEmbedUrl = null;
  }

  // =========================================================
  // SEARCH RESULTS (GET Business/search)
  // =========================================================

  /** Merge places from the directory into the built-in India-wide list. */
  ensureLocationSuggestions(): void {
    if (this.cityNames.size) return;
    this.businessService
      .getBusinessList({ pageIndex: 1, pageSize: 100 })
      .subscribe(
        (res) => {
          const map = new Map<number, BusinessDirectoryItem>();
          (res.items || []).forEach((b) => map.set(b.id, b));
          this.buildLocationIndex(map);
        },
        () => {},
      );
  }

  private buildLocationIndex(lookup: Map<number, BusinessDirectoryItem>): void {
    const cityCounts = new Map<string, number>();
    const combos = new Set<string>();
    this.cityNames.clear();
    this.areaNames.clear();

    lookup.forEach((b) => {
      const city = (b.businessAddressDto?.city || '').trim();
      const area = (b.businessAddressDto?.area || '').trim();
      if (city) {
        this.cityNames.add(city);
        cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
      }
      if (area) this.areaNames.add(area);
      if (city && area) combos.add(`${area}, ${city}`);
    });

    const cities = Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([city]) => city);
    this.locationSuggestions = Array.from(
      new Set([
        ...Array.from(combos).sort(), // "Area, City" from real listings
        ...cities,
        ...INDIAN_CITIES,
      ]),
    );
  }

  /** All spellings of a place name (e.g. Bangalore <-> Bengaluru). */
  private nameVariants(name: string): string[] {
    const lower = name.trim().toLowerCase();
    const group = LOCATION_ALIASES.find((g) =>
      g.some((n) => n.toLowerCase() === lower),
    );
    const known = [...this.cityNames, ...this.areaNames].find(
      (n) => n.toLowerCase() === lower,
    );
    return Array.from(new Set([known || name.trim(), ...(group || [])]));
  }

  /**
   * Turns the single free-text location box into API param sets to try, in
   * order. The text can be any place in India, so when it is ambiguous we
   * try it as a city first and then as an area (and with alternate spellings)
   * until something returns results:
   *   "560066"                -> pincode
   *   "Whitefield, Bangalore" -> area + city (then city alone)
   *   "Pune" / "Koramangala"  -> city, then area
   */
  private locationCandidates(text: string): LocationParams[] {
    const value = (text || '').trim();
    if (!value) return [{}];
    if (/^\d{6}$/.test(value)) return [{ pincode: value }];

    const parts = value
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const areas = this.nameVariants(parts[0]);
      const cities = this.nameVariants(parts[1]);
      return [
        ...cities.flatMap((city) => areas.map((area) => ({ area, city }))),
        ...cities.map((city) => ({ city })),
      ];
    }

    const variants = this.nameVariants(value);
    const knownArea = variants.some((v) => this.areaNames.has(v));
    const knownCity = variants.some((v) => this.cityNames.has(v));
    const asCity = variants.map((city) => ({ city }));
    const asArea = variants.map((area) => ({ area }));
    return knownArea && !knownCity
      ? [...asArea, ...asCity]
      : [...asCity, ...asArea];
  }

  /** Tries each location candidate until one returns results. */
  private searchWithFallback(
    base: Omit<BusinessSearchQuery, 'city' | 'area' | 'pincode'>,
    candidates: LocationParams[],
  ): Observable<BusinessSearchResult[]> {
    const [first, ...rest] = candidates;
    return this.businessService.searchBusinesses({ ...base, ...first }).pipe(
      switchMap((list) => {
        if (!(list || []).length && rest.length) {
          return this.searchWithFallback(base, rest);
        }
        this.activeLocation = first; // keep paging with what worked
        return of(list || []);
      }),
    );
  }

  /**
   * @param reset true  -> page 1, replace results
   *              false -> append next page
   */
  runSearch(reset: boolean): void {
    if (reset) {
      this.searchSub?.unsubscribe();
      this.searchPageIndex = 1;
      this.searchError = false;
      this.isLoadingMoreSearch = false;
      if (this.searchResults.length === 0) {
        this.searchLoading = true;
      } else {
        this.searchRefreshing = true;
      }
    } else {
      this.isLoadingMoreSearch = true;
    }

    const pageIndex = this.searchPageIndex;

    const base = {
      searchText: this.appliedQuery,
      businessCategoryId: this.selectedCategoryId,
      businessTypeId: this.selectedBusinessType
        ? (this.businessTypeNameToId.get(this.selectedBusinessType) ?? null)
        : null,
      sellerTypeId: this.selectedSellerType
        ? (this.sellerTypeNameToId.get(this.selectedSellerType) ?? null)
        : null,
      pageIndex,
      pageSize: this.searchPageSize,
    };
    // First page tries every candidate; later pages reuse the one that worked.
    const candidates = reset
      ? this.locationCandidates(this.appliedLocation)
      : [this.activeLocation];

    this.searchSub = this.searchWithFallback(base, candidates)
      .pipe(
        switchMap((list) =>
          // Directory data is only enrichment; search must work without it.
          this.businessService
            .resolveBusinessesByIds((list || []).map((r) => r.businessId))
            .pipe(
              catchError(() => of(new Map<number, BusinessDirectoryItem>())),
              map((lookup) => ({ list, lookup })),
            ),
        ),
      )
      .subscribe(
        ({ list, lookup }) => {
          if (!this.cityNames.size && lookup.size)
            this.buildLocationIndex(lookup);
          const incoming = (list || []).map((r) => this.toSearchVM(r, lookup));
          this.searchResults = reset
            ? incoming
            : this.searchResults.concat(
                incoming.filter(
                  (n) =>
                    !this.searchResults.some(
                      (e) => e.business.id === n.business.id,
                    ),
                ),
              );
          this.searchHasMore = (list || []).length >= this.searchPageSize;
          this.searchLoading = false;
          this.searchRefreshing = false;
          this.isLoadingMoreSearch = false;

          this.loadOfferingImages(incoming);
          this.ensureMapSelection();
          setTimeout(() => this.setupInfiniteScroll());
        },
        () => {
          this.searchError = true;
          this.searchLoading = false;
          this.searchRefreshing = false;
          this.isLoadingMoreSearch = false;
        },
      );
  }

  private toSearchVM(
    r: BusinessSearchResult,
    lookup: Map<number, BusinessDirectoryItem>,
  ): SearchResultVM {
    const known = lookup.get(r.businessId);
    const business: BusinessDirectoryItem = known
      ? { ...known }
      : ({
          id: r.businessId,
          businessName: r.businessName,
          logoUrl: r.logoUrl,
          description: r.description,
          businessAddressDto: {
            city: r.city,
            area: r.area,
            pincode: r.pincode,
          },
        } as any);

    // The search response is the source of truth for what it returns.
    if (r.logoUrl) business.logoUrl = r.logoUrl;
    if (r.businessName) business.businessName = r.businessName;

    const offerings: SearchOfferingVM[] = (r.matchingOfferings || []).map(
      (o) => ({
        id: o.businessOfferingId,
        name: (o.name || '').trim(),
        description: this.stripHtml(o.description),
        price: o.price ?? null,
        businessId: r.businessId,
        imageUrls: [],
      }),
    );

    const score = Math.max(
      r.relevanceScore || 0,
      ...(r.matchingOfferings || []).map((o) => o.relevanceScore || 0),
    );

    const place = [r.area, r.city].filter(Boolean).join(', ');
    return {
      business,
      location: r.pincode ? `${place} – ${r.pincode}` : place,
      score,
      offerings,
    };
  }

  /** The search API has no offering image; fetch it per matching offering. */
  private loadOfferingImages(results: SearchResultVM[]): void {
    const pending: SearchOfferingVM[] = [];
    results.forEach((r) => r.offerings.forEach((o) => pending.push(o)));
    if (!pending.length) return;

    const pick = (res: any, id: number): string => {
      const rec = Array.isArray(res)
        ? res.find((x: any) => Number(x?.id) === id)
        : res;
      return this.cleanImageUrl(rec?.imageUrl || '');
    };

    from(pending)
      .pipe(
        mergeMap(
          (o) =>
            this.businessService.getBusinessOfferingById(o.id).pipe(
              map((res: any) => pick(res, o.id)),
              catchError(() => of('')),
              // Fall back to the business's offering list if the by-id call
              // carried no image.
              switchMap((url) =>
                url
                  ? of(url)
                  : this.businessService
                      .getBusinessOfferingsByBusinessId(o.businessId)
                      .pipe(
                        map((list: any) => pick(list, o.id)),
                        catchError(() => of('')),
                      ),
              ),
              map((url) => ({ o, url })),
            ),
          4,
        ),
      )
      .subscribe(({ o, url }) => {
        if (url) o.imageUrls = [url];
      });
  }

  // ---------- Image fallbacks ----------

  private failedImages = new Set<string>();

  markImageFailed(url: string | null | undefined): void {
    if (url) this.failedImages.add(url);
  }

  /** First usable business image: logo -> cover -> first gallery photo. */
  businessImage(b: BusinessDirectoryItem): string {
    const candidates = [
      b.logoUrl,
      b.coverImageUrl,
      b.businessGalleryDtoList?.[0]?.thumbnailUrl,
      b.businessGalleryDtoList?.[0]?.imageUrl,
    ]
      .map((u) => this.cleanImageUrl(u || ''))
      .filter((u) => !!u && !this.failedImages.has(u));
    return candidates[0] || '';
  }

  offeringImage(o: SearchOfferingVM): string {
    return o.imageUrls.find((u) => !this.failedImages.has(u)) || '';
  }

  /** Trim, take the first URL if several are packed in one string, encode spaces. */
  private cleanImageUrl(raw: string): string {
    const first = (raw || '').split(/[,;|]/)[0].trim();
    return first.replace(/\s/g, '%20');
  }

  get sortedSearchResults(): SearchResultVM[] {
    const list = [...this.searchResults];
    switch (this.sortBy) {
      case 'newest':
        return list.sort(
          (a, b) =>
            (b.business.establishedYear || 0) -
            (a.business.establishedYear || 0),
        );
      case 'name':
        return list.sort((a, b) =>
          (a.business.businessName || '').localeCompare(
            b.business.businessName || '',
          ),
        );
      default:
        return list.sort((a, b) => b.score - a.score);
    }
  }

  get searchTitleQuery(): string {
    return this.appliedQuery.trim();
  }

  get searchTitleLocation(): string {
    return this.appliedLocation.trim();
  }

  get searchCountLabel(): string {
    const n = this.searchResults.length;
    if (this.searchLoading) return 'Searching…';
    if (n === 0) return 'No businesses found';
    const count = this.searchHasMore ? `${n}+` : `${n}`;
    return `About ${count} ${n === 1 && !this.searchHasMore ? 'business' : 'businesses'} found`;
  }

  trackBySearchResult(_i: number, r: SearchResultVM): number {
    return r.business.id;
  }

  trackBySearchOffering(_i: number, o: SearchOfferingVM): number {
    return o.id;
  }

  formatPrice(price: number | null): string {
    if (price === null || price === undefined) return '';
    return `₹${Number(price).toLocaleString('en-IN')}`;
  }

  // ---------- List / Map toggle ----------

  setResultsView(mode: 'list' | 'map'): void {
    this.resultsView = mode;
    if (mode === 'map') this.ensureMapSelection();
  }

  private ensureMapSelection(): void {
    if (this.resultsView !== 'map' || !this.searchResults.length) return;
    const current = this.searchResults.find(
      (r) => r.business.id === this.selectedMapResultId,
    );
    this.selectMapResult(current || this.sortedSearchResults[0]);
  }

  selectMapResult(r: SearchResultVM | undefined): void {
    if (!r) return;
    this.selectedMapResultId = r.business.id;
    // Build the SafeResourceUrl once per selection; a fresh object on every
    // change-detection pass would reload the iframe continuously.
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${encodeURIComponent(this.mapQuery(r))}&output=embed`,
    );
  }

  private mapQuery(r: SearchResultVM): string {
    const a = r.business.businessAddressDto;
    return [r.business.businessName, a?.address, r.location]
      .filter(Boolean)
      .join(', ');
  }

  get selectedMapResult(): SearchResultVM | undefined {
    return this.searchResults.find(
      (r) => r.business.id === this.selectedMapResultId,
    );
  }

  openInGoogleMaps(r: SearchResultVM): string {
    return (
      r.business.businessAddressDto?.googleMapURL ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapQuery(r))}`
    );
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
    this.resetFilters();
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
    let result = this.businesses.filter((b: any) => {
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

  /** Loads this user's wishlisted business ids (API-backed). */
  private loadWishlist(): void {
    const uid = this.currentUserId;
    if (!uid) {
      this.favoriteIds = new Set();
      return;
    }
    this.businessService.getWishlistBusinesses(uid).subscribe(
      (list) => {
        const rows: any[] = Array.isArray(list)
          ? list
          : (list as any)?.items || (list as any)?.data || [];
        this.favoriteIds = new Set(
          rows
            .filter((w) => !w.isDeleted)
            .map((w) => Number(w.businessId))
            .filter((id) => !!id),
        );
      },
      (err) => console.error('Could not load wishlist', err),
    );
  }

  private get currentUserId(): number {
    return Number(localStorage.getItem('id')) || 0;
  }

  private wishlistBusy = new Set<number>();
  private loginDialogOpen = false;

  /** Opens the normal user login; resumes the wishlist action once logged in. */
  private promptLogin(then: () => void): void {
    if (this.loginDialogOpen) return;
    this.loginDialogOpen = true;
    this.notify('Please log in to use your wishlist.');
    const ref = this.dialog.open(LoginComponent, {
      panelClass: 'login-dialog-container',
      autoFocus: false,
    });
    ref.afterClosed().subscribe(() => {
      this.loginDialogOpen = false;
      if (this.currentUserId) {
        this.loadWishlist();
        then();
      }
    });
  }

  toggleFavorite(business: BusinessDirectoryItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.currentUserId) {
      this.promptLogin(() => this.toggleFavorite(business, event));
      return;
    }
    const uid = this.currentUserId;
    const id = Number(business?.id);
    if (!id || this.wishlistBusy.has(id)) return;

    const was = this.favoriteIds.has(id);
    this.setFavorite(id, !was); // optimistic
    this.wishlistBusy.add(id);

    const call$ = was
      ? this.businessService.removeBusinessFromWishlist(uid, id)
      : this.businessService.addBusinessToWishlist(uid, id);

    call$.subscribe(
      () => {
        this.wishlistBusy.delete(id);
        this.notify(was ? 'Removed from wishlist' : 'Added to wishlist');
        if (!was) {
          this.trackBusinessAction(
            business,
            BusinessAnalyticsEventType.Wishlist,
          );
        }
      },
      (err) => {
        console.error('Wishlist update failed', err);
        this.setFavorite(id, was); // revert
        this.wishlistBusy.delete(id);
        this.notify(
          err?.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Something went wrong. Please try again.',
        );
      },
    );
  }

  /** Always assigns a new Set so the heart re-renders. */
  private setFavorite(id: number, on: boolean): void {
    const next = new Set(this.favoriteIds);
    on ? next.add(id) : next.delete(id);
    this.favoriteIds = next;
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
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
    if (business.tabRefGUID) {
      const cmds = buildBusinessCommands(business);
      if (cmds) this.router.navigate(cmds);
      return;
    }

    // Search hits can arrive without a profile GUID; look it up on demand.
    if (!business.id) return;
    this.businessService
      .resolveBusinessesByIds([business.id])
      .subscribe((lookup) => {
        const found = lookup.get(business.id);
        if (found?.tabRefGUID) {
          Object.assign(business, found, {
            logoUrl: business.logoUrl || found.logoUrl,
          });
          const cmds = buildBusinessCommands(business);
          if (cmds) {
            this.router.navigate(cmds);
            return;
          }
        }
        this.notify('Could not open this business profile. Please try again.');
      });
  }

  /** Offering rows are not links themselves: they open the business profile. */
  openBusinessFromOffering(event: Event, r: SearchResultVM): void {
    event.stopPropagation();
    this.trackBusinessAction(
      r.business,
      BusinessAnalyticsEventType.ProfileView,
      {
        once: true,
      },
    );
    this.viewBusiness(r.business);
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
    // Same-tab navigation shares the 30-minute "once" key with the profile
    // page's own ProfileView, so the visit is never double counted.
    this.trackBusinessAction(business, BusinessAnalyticsEventType.ProfileView, {
      once: true,
    });
    this.viewBusiness(business);
  }

  /** Records a card action. Owners are never counted on their own business,
   * and a failed request never affects the page. */
  private trackBusinessAction(
    business: BusinessDirectoryItem,
    type: BusinessAnalyticsEventType,
    options: { once?: boolean } = {},
  ): void {
    if (!business?.id) return;
    const userId = Number(localStorage.getItem('id'));
    if (userId && business.userId === userId) return;
    this.tracker.trackBusiness(business.id, type, options);
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
    if (this.getBusinessPhone(business)) {
      this.trackBusinessAction(business, BusinessAnalyticsEventType.Call);
      return;
    }

    event.preventDefault();
    this.resolveContact(business, () => {
      const phone = this.getBusinessPhone(business);
      if (phone) {
        this.trackBusinessAction(business, BusinessAnalyticsEventType.Call);
        window.location.href = `tel:${phone}`;
      } else {
        alert('Phone number not available for this business.');
      }
    });
  }

  onWhatsAppClick(event: Event, business: BusinessDirectoryItem): void {
    event.stopPropagation();
    if (this.getWhatsAppLink(business)) {
      this.trackBusinessAction(
        business,
        BusinessAnalyticsEventType.WhatsAppClick,
      );
      return;
    }

    event.preventDefault();
    const win = window.open('', '_blank');
    this.resolveContact(business, () => {
      const link = this.getWhatsAppLink(business);
      if (link && win) {
        this.trackBusinessAction(
          business,
          BusinessAnalyticsEventType.WhatsAppClick,
        );
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
