import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessService } from '../../modules/business/service/business.service';
import {
  BusinessDirectoryItem,
  BusinessOfferDto,
} from '../../modules/business/model/Business';
import { CommonService } from '../../shared/service/common.service';
import { AdminDashboardService } from '../../modules/admin/service/admin-dashboard.service';
import { BusinessLoginComponent } from '../../modules/business/components/business-login/business-login.component';
import { LoginComponent } from '../../modules/user/component/login/login.component';
import { UserService } from '../user/service/user.service';
import { WishlistItem } from '../classified-ads/model/ads';
import { NewsService } from '../news/service/news.service';
import { NewsArticle, NewsCategory } from '../news/model/News';
import { EventService } from '../event/service/event.service';
import { EventCategory, EventItem } from '../event/model/Event';
import { buildBusinessCommands } from '../business/utils/business-url.util';
import { buildPostCommands } from 'src/app/shared/utils/post-url.util';

interface OfferViewModel extends BusinessOfferDto {
  businessName: string;
  icon: string;
}

interface BusinessViewModel extends BusinessDirectoryItem {
  link: any[] | null;
  rating?: string;
  reviewCount?: number;
}

interface TrustItem {
  icon: string;
  title: string;
  subtitle: string;
  colorClass: string;
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css'],
})
export class MarketplaceComponent implements OnInit {
  // Search
  searchQuery: string = '';

  // Businesses
  businesses: BusinessViewModel[] = [];
  businessesLoading: boolean = true;
  businessesError: boolean = false;

  // Featured Ads
  featuredAds: any[] = [];
  adsLoading: boolean = true;
  adsError: boolean = false;
  private allAds: any[] = [];

  // Categories
  categories: any[] = [];
  categoriesLoading: boolean = true;
  categoriesError: boolean = false;

  // Offers
  offers: OfferViewModel[] = [];
  offersLoading: boolean = true;
  offersError: boolean = false;

  private readonly OFFER_SOURCE_BUSINESS_LIMIT = 100;
  private readonly OFFER_DISPLAY_LIMIT = 8;

  // Icon per offer type
  private offerTypeIcons: { [key: number]: string } = {
    1: 'local_offer', // percentage off
    2: 'discount', // flat amount off
    3: 'card_giftcard', // bundled / gift
    4: 'restaurant', // category-specific (fallback used loosely)
  };

  // Category icon mapping
  categoryIcons: { [key: string]: string } = {
    'Mobiles & Tablets': 'smartphone',
    Mobiles: 'smartphone',
    Cars: 'directions_car',
    Vehicles: 'directions_car',
    Bikes: 'two_wheeler',
    Property: 'home',
    'Real Estate': 'home',
    Jobs: 'work',
    Furniture: 'weekend',
    'Home & Kitchen': 'kitchen',
    Electronics: 'devices_other',
    Fashion: 'checkroom',
    Books: 'menu_book',
    Sports: 'sports_soccer',
    Pets: 'pets',
    'Commercial Services': 'handyman',
  };

  // Category mapping for IDs
  categoryMapping: { [key: string]: string } = {
    '1': 'Gadgets',
    '2': 'Vehicles',
    '3': 'Properties',
    '4': 'Jobs',
    '5': 'Electronics',
    '6': 'Furniture',
    '7': 'Books',
    '8': 'Sports',
    '9': 'Pets',
    '10': 'Fashion',
    '11': 'Commercial Services',
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

  // Business News
  businessNews: any[] = [];
  businessNewsLoading: boolean = true;
  businessNewsError: boolean = false;

  // Business Events
  businessEvents: any[] = [];
  businessEventsLoading: boolean = true;
  businessEventsError: boolean = false;

  favoriteIds: Set<number> = new Set();

  private readonly htmlTagRegex = /<[^>]*>/g;

  stripHtml(value: string | undefined | null): string {
    if (!value) return '';
    return value
      .replace(this.htmlTagRegex, ' ')
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

  toggleFavorite(business: BusinessDirectoryItem, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoriteIds.has(business.id)
      ? this.favoriteIds.delete(business.id)
      : this.favoriteIds.add(business.id);
  }

  isFavorite(business: BusinessDirectoryItem): boolean {
    return this.favoriteIds.has(business.id);
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

  getBusinessUrl(business: BusinessDirectoryItem): string {
    if (!business.tabRefGUID) return '';
    const cmds = buildBusinessCommands(business);
    if (!cmds) return '';
    return this.router.serializeUrl(this.router.createUrlTree(cmds));
  }

  onBusinessLinkClick(
    event: MouseEvent,
    business: BusinessDirectoryItem,
  ): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0)
      return;
    event.preventDefault();
    this.viewBusiness(business);
  }

  constructor(
    private businessService: BusinessService,
    private commonService: CommonService,
    private adminService: AdminDashboardService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private newsService: NewsService,
    private eventService: EventService,
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
    this.fetchAds();
    this.fetchCategories();
    this.fetchBusinessNews();
    this.fetchBusinessEvents();
  }

  // =========================================================
  // SEARCH
  // =========================================================
  activeFilter: 'all' | 'business' | 'ads' = 'all';

  performSearch(): void {
    if (this.searchQuery.trim().length === 0) return;
    this.activeFilter = 'all';
    setTimeout(() => {
      const resultsSection = document.getElementById('search-results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.activeFilter = 'all';
  }

  setFilter(filter: 'all' | 'business' | 'ads'): void {
    this.activeFilter = filter;
  }

  get isSearching(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  get filteredBusinessResults(): BusinessViewModel[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return [];
    return this.businesses.filter(
      (b) =>
        (b.businessName || '').toLowerCase().includes(q) ||
        (b.businessCategory || '').toLowerCase().includes(q) ||
        (this.getLocationLabel(b) || '').toLowerCase().includes(q),
    );
  }

  get filteredAdResults(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return [];
    return this.allAds
      .filter((ad) => ad.isActive !== false)
      .filter(
        (ad) =>
          (ad.title || '').toLowerCase().includes(q) ||
          (this.getCategoryName(ad.categoryId) || '')
            .toLowerCase()
            .includes(q) ||
          [ad.city, ad.state]
            .filter(Boolean)
            .join(', ')
            .toLowerCase()
            .includes(q),
      )
      .map((ad) => ({
        ...ad,
        link: this.getAdLink(ad),
        priceLabel: this.formatAdPrice(ad),
        isWishlisted: false,
        locationLabel:
          [ad.city, ad.state].filter(Boolean).join(', ') ||
          'Location not specified',
        postedAgo: this.getPostedAgo(ad.createdOn),
      }));
  }

  get searchResultsCount(): number {
    if (this.activeFilter === 'business')
      return this.filteredBusinessResults.length;
    if (this.activeFilter === 'ads') return this.filteredAdResults.length;
    return this.filteredBusinessResults.length + this.filteredAdResults.length;
  }

  get showBusinessResults(): boolean {
    return this.activeFilter === 'all' || this.activeFilter === 'business';
  }

  get showAdResults(): boolean {
    return this.activeFilter === 'all' || this.activeFilter === 'ads';
  }
  // =========================================================
  // NAVIGATION
  // =========================================================

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // =========================================================
  // MODALS
  // =========================================================

  openBusinessLoginModal(): void {
    this.dialog.open(BusinessLoginComponent, {
      // width: '800px',
      // maxWidth: '95vw',
      panelClass: 'login-dialog-container',
      autoFocus: false,
    });
  }

  postAdd(): void {
    if (localStorage.getItem('id') != null) {
      this.router.navigate(['/post-menu']);
    } else {
      this.dialog.open(LoginComponent, {
        // width: '400px',
        panelClass: 'login-dialog-container',
      });
    }
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

        this.businesses = activeBusinesses.slice(0, 15).map((b) => ({
          ...b,
          link: this.getBusinessLink(b),
          rating: (4 + Math.random() * 0.8).toFixed(1),
          reviewCount: Math.floor(Math.random() * 200) + 20,
        }));
        this.businessesLoading = false;

        this.fetchOffers(
          activeBusinesses.slice(0, this.OFFER_SOURCE_BUSINESS_LIMIT),
        );
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

        // Featured offers first, then by soonest expiry
        flattened.sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
          }
          return moment(a.endDate).diff(moment(b.endDate));
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

  private isOfferValid(offer: BusinessOfferDto): boolean {
    if (!offer.endDate) return true;
    return moment(offer.endDate).isSameOrAfter(moment(), 'day');
  }

  private getOfferIcon(offerType: number): string {
    return this.offerTypeIcons[offerType] || 'local_offer';
  }

  formatOfferValidity(endDate: string): string {
    if (!endDate) return '';
    return moment(endDate).format('DD MMM YYYY');
  }

  // =========================================================
  // FETCH FEATURED ADS
  // =========================================================
  fetchAds(): void {
    this.adsLoading = true;
    this.adsError = false;
    this.adminService.getAllItems().subscribe(
      (data: any[]) => {
        this.allAds = data || [];
        const premiumAds = this.allAds.filter((ad) => ad.isPremium);
        const otherAds = this.allAds.filter((ad) => !ad.isPremium);
        const source = [...premiumAds, ...otherAds];

        this.featuredAds = source.slice(0, 10).map((ad) => ({
          ...ad,
          link: this.getAdLink(ad),
          priceLabel: this.formatAdPrice(ad),
          isWishlisted: false,
          locationLabel:
            [ad.city, ad.state].filter(Boolean).join(', ') ||
            'Location not specified',
          postedAgo: this.getPostedAgo(ad.createdOn),
        }));
        this.adsLoading = false;
        this.updateCategoryCounts();
      },
      () => {
        this.adsError = true;
        this.adsLoading = false;
      },
    );
  }

  private formatAdPrice(ad: any): string {
    if (ad.price) {
      return `₹${Number(ad.price).toLocaleString('en-IN')}`;
    }
    if (ad.minSalary || ad.maxSalary) {
      const period = ad.salaryPeriodType === 2 ? '/year' : '/month';
      if (ad.minSalary && ad.maxSalary) {
        return `₹${Number(ad.minSalary).toLocaleString('en-IN')}-₹${Number(
          ad.maxSalary,
        ).toLocaleString('en-IN')}${period}`;
      }
      return `₹${Number(ad.minSalary || ad.maxSalary).toLocaleString(
        'en-IN',
      )}${period}`;
    }
    return 'Price on request';
  }

  private getPostedAgo(createdOn: string): string {
    if (!createdOn) return '';
    const diffMs = Date.now() - new Date(createdOn).getTime();
    const diffMins = Math.max(Math.floor(diffMs / 60000), 0);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  toggleWishlist(ad: any, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (localStorage.getItem('id') == null) {
      this.dialog.open(LoginComponent, {
        // width: '400px',
        panelClass: 'login-dialog-container',
      });
      return;
    }

    ad.isWishlisted = !ad.isWishlisted;
    if (ad.isWishlisted) {
      const wishlistItem: WishlistItem = {
        id: 0,
        productId: ad.tableRefGuid,
        categoryId: ad.categoryId,
        createdBy: localStorage.getItem('id'),
        createdOn: new Date().toISOString(),
      };
      this.userService.AddWishList(wishlistItem).subscribe(
        () => {},
        () => {},
      );
    }
  }

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  private readonly categoryColorClasses: string[] = [
    'c-red',
    'c-pink',
    'c-green',
    'c-blue',
    'c-orange',
    'c-purple',
    'c-teal',
    'c-indigo',
  ];

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = false;

    this.commonService.getAllCategory().subscribe(
      (data: any) => {
        this.categories = (data || [])
          .slice(0, 10)
          .map((c: any, i: number) => ({
            ...c,
            colorClass:
              this.categoryColorClasses[i % this.categoryColorClasses.length],
          }));

        this.categoriesLoading = false;
        this.updateCategoryCounts();
      },
      () => {
        this.categories = [];
        this.categoriesError = true;
        this.categoriesLoading = false;
      },
    );
  }

  // =========================================================
  // CATEGORY COUNT
  // =========================================================

  private updateCategoryCounts(): void {
    if (!this.categories.length || !this.allAds.length) {
      return;
    }
    this.categories.forEach((category: any) => {
      category.count = this.allAds.filter(
        (ad) => String(ad.categoryId) === String(category.id),
      ).length;
    });
  }

  getCategoryCountLabel(category: any): string {
    const count = category?.count;
    if (count === undefined || count === null) {
      return 'Loading…';
    }
    if (count === 0) {
      return 'New on Marketplace';
    }
    return `${count} ${count === 1 ? 'Listing' : 'Listings'}`;
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

  trackByOfferId(_index: number, offer: OfferViewModel): number {
    return offer.id;
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

  onBusinessImageError(event: any): void {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-image-placeholder';
      placeholder.innerHTML =
        '<span class="material-icons-outlined">storefront</span>';
      parent.appendChild(placeholder);
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.searchQuery = input.value;
    }
  }

  onLogoError(event: any): void {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'business-logo placeholder';
      const business = this.businesses.find(
        (b) => b.logoUrl === event.target.src,
      );
      const initials = business ? this.getInitials(business.businessName) : '?';
      placeholder.innerHTML = `<span class="logo-initials">${initials}</span>`;
      parent.appendChild(placeholder);
    }
  }

  // =========================================================
  // ADS HELPERS
  // =========================================================

  trackByAdId(_index: number, ad: any): string {
    return ad.tableRefGuid || ad.id;
  }

  getAdImage(ad: any): string {
    const imageLists = [
      ad.gadgetImageList,
      ad.vehicleImageList,
      ad.electronicApplianceImageList,
      ad.furnitureImageList,
      ad.sportImageList,
      ad.petImageList,
      ad.fashionImageList,
      ad.bookImageList,
      ad.propertyImageList,
      ad.jobImageList,
      ad.commercialServiceImageList,
      ad.commercialServiceImagesList,
    ];

    for (const list of imageLists) {
      if (list && list.length > 0 && list[0]?.imageURL) {
        return list[0].imageURL;
      }
    }
    return 'assets/image_not_available.jpg';
  }

  onAdImageError(event: any): void {
    event.target.src = 'assets/image_not_available.jpg';
  }

  getBusinessLink(business: BusinessDirectoryItem): any[] | null {
    if (!business.tabRefGUID) return null;
    return buildBusinessCommands(business) ?? null;
  }

  getAdLink(ad: any): any[] | null {
    const category = this.getCategoryName(ad.categoryId);
    if (!category || !ad.tableRefGuid) return null;
    return (
      buildPostCommands({ ...ad, category }) ?? [
        '/classified-ads',
        category,
        'post-details',
        ad.tableRefGuid,
      ]
    );
  }

  viewAd(ad: any): void {
    const category = this.getCategoryName(ad.categoryId);
    if (category && ad.tableRefGuid) {
      const cmds = buildPostCommands({ ...ad, category });
      this.router.navigate(
        cmds ?? [`/classified-ads/${category}/post-details/${ad.tableRefGuid}`],
      );
    }
  }

  truncateTitle(title: string, maxLength: number = 25): string {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  getCategoryName(categoryId: string): string {
    return this.categoryMapping[categoryId] || '';
  }

  getCategoryCount(categoryId: number): number {
    const counts: { [key: number]: number } = {
      1: 1200,
      2: 950,
      3: 1500,
      4: 1100,
      5: 850,
      6: 900,
      7: 600,
      8: 450,
      9: 350,
      10: 500,
      11: 400,
    };
    return counts[categoryId] || 0;
  }

  // =========================================================
  // CATEGORY HELPERS
  // =========================================================

  getCategoryIcon(categoryName: string): string {
    return this.categoryIcons[categoryName] || 'category';
  }

  navigateToCategory(category: any): void {
    const categoryName = category.categoryName;
    const routeMap: { [key: string]: string } = {
      Electronics: 'Electronics',
      Automobile: 'Vehicles',
      Automotive: 'Vehicles',
      'Food & Restaurants': 'Commercial Services',
      'Home & Living': 'Furniture',
      'Beauty & Wellness': 'Fashion',
      Services: 'Commercial Services',
      Jobs: 'Jobs',
      'Real Estate': 'Properties',
      Education: 'Commercial Services',
      'Health & Care': 'Commercial Services',
    };

    const route = routeMap[categoryName] || categoryName;
    this.router.navigate([`classified-ads/${route}/view-posts`], {
      queryParams: { type: route },
    });
  }

  // =========================================================
  // FETCH BUSINESS NEWS
  // =========================================================

  fetchBusinessNews(): void {
    this.businessNewsLoading = true;
    this.businessNewsError = false;

    forkJoin({
      articles: this.newsService.getArticles(),
      categories: this.newsService
        .getCategories()
        .pipe(catchError(() => of([] as NewsCategory[]))),
    }).subscribe(
      ({ articles, categories }) => {
        const catMap = new Map<number, string>(
          (categories || []).map((c) => [c.id, c.name] as [number, string]),
        );
        const all = articles || [];

        const businessOnly = all.filter((a) =>
          (catMap.get(a.newsCategoryId) || '')
            .toLowerCase()
            .includes('business'),
        );
        const isBusiness = (a: NewsArticle) =>
          (catMap.get(a.newsCategoryId) || '')
            .toLowerCase()
            .includes('business');

        this.businessNews = [...all]
          .sort((a, b) => {
            if (isBusiness(a) !== isBusiness(b)) return isBusiness(a) ? -1 : 1;
            return (
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime()
            );
          })
          .slice(0, 10)
          .map((a) => ({
            ...a,
            link: a.slug ? ['/news/article', a.slug] : null,
            imageUrl: a.featuredImageUrl || 'assets/image_not_available.jpg',
            postedAgo: this.getPostedAgo(a.publishedAt || a.createdAt),
            categoryLabel: catMap.get(a.newsCategoryId) || 'News',
            readingTimeLabel: a.readingTimeMinutes
              ? `${a.readingTimeMinutes} min read`
              : '',
          }));

        this.businessNewsLoading = false;
      },
      () => {
        this.businessNews = [];
        this.businessNewsError = true;
        this.businessNewsLoading = false;
      },
    );
  }

  viewNewsArticle(article: any): void {
    if (article?.slug) {
      this.router.navigate(['/news/article', article.slug]);
    }
  }

  trackByNewsId(_index: number, article: any): string | number {
    return article.slug || article.id;
  }

  onNewsImageError(event: any): void {
    event.target.src = 'assets/image_not_available.jpg';
  }

  reads(count: number): string {
    if (!count) return '';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K reads`;
    return `${count} reads`;
  }

  // =========================================================
  // FETCH BUSINESS EVENTS
  // =========================================================

  fetchBusinessEvents(): void {
    this.businessEventsLoading = true;
    this.businessEventsError = false;

    forkJoin({
      events: this.eventService.getEvents(),
      categories: this.eventService
        .getCategories()
        .pipe(catchError(() => of([] as EventCategory[]))),
    }).subscribe(
      ({ events, categories }) => {
        const catMap = new Map<number, string>(
          (categories || []).map((c) => [c.id, c.name] as [number, string]),
        );
        const all = events || [];

        const businessOnly = all.filter(
          (e) =>
            (catMap.get(e.eventCategoryId) || '').toLowerCase() === 'business',
        );

        const isBusiness = (e: EventItem) =>
          (catMap.get(e.eventCategoryId) || '').toLowerCase() === 'business';

        const sorted = [...all].sort((a, b) => {
          if (isBusiness(a) !== isBusiness(b)) return isBusiness(a) ? -1 : 1;
          if (!!b.isFeatured !== !!a.isFeatured) return b.isFeatured ? 1 : -1;
          return (
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime()
          );
        });

        this.businessEvents = sorted.slice(0, 10).map((e) => ({
          ...e,
          link: e.slug ? ['/events/event', e.slug] : null,
          imageUrl: e.featuredImageUrl || 'assets/image_not_available.jpg',
          badge: this.eventBadge(e),
          dayLabel: this.dayOf(e.startDateTime),
          monthLabel: this.monthOf(e.startDateTime),
          timeLabel: this.timeRange(e),
          priceLabel: this.priceLabel(e),
          categoryLabel: catMap.get(e.eventCategoryId) || 'Event',
        }));

        this.businessEventsLoading = false;
      },
      () => {
        this.businessEvents = [];
        this.businessEventsError = true;
        this.businessEventsLoading = false;
      },
    );
  }

  eventBadge(e: EventItem): string | null {
    if (e.isFeatured) return 'Featured';
    if (e.isTrending) return 'Trending';
    const created = new Date(e.createdAt).getTime();
    if (!isNaN(created) && Date.now() - created < 7 * 24 * 3600000)
      return 'New';
    if (e.viewCount > 1000) return 'Popular';
    return null;
  }

  dayOf(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  monthOf(dateStr: string): string {
    return new Date(dateStr)
      .toLocaleDateString('en-US', { month: 'short' })
      .toUpperCase();
  }

  timeRange(e: EventItem): string {
    const start = new Date(e.startDateTime);
    const startStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${startStr} Onwards`;
  }

  priceLabel(e: EventItem): string {
    return e.isFree
      ? 'Free Entry'
      : `₹${e.price.toLocaleString('en-IN')} Onwards`;
  }

  viewBusinessEvent(e: any): void {
    if (e?.slug) this.router.navigate(['/events/event', e.slug]);
  }

  trackByEventId(_index: number, e: any): string | number {
    return e.slug || e.id;
  }

  onEventImageError(event: any): void {
    event.target.src = 'assets/image_not_available.jpg';
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
}
