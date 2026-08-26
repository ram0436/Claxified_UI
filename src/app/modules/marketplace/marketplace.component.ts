import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import * as moment from "moment";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { BusinessService } from "../../modules/business/service/business.service";
import {
  BusinessDirectoryItem,
  BusinessOfferDto,
} from "../../modules/business/model/Business";
import { CommonService } from "../../shared/service/common.service";
import { AdminDashboardService } from "../../modules/admin/service/admin-dashboard.service";
import { BusinessLoginComponent } from "../../modules/business/components/business-login/business-login.component";
import { LoginComponent } from "../../modules/user/component/login/login.component";

// Local view-model so the template doesn't need to know about offerType numbers etc.
interface OfferViewModel extends BusinessOfferDto {
  businessName: string;
  icon: string;
}

@Component({
  selector: "app-marketplace",
  templateUrl: "./marketplace.component.html",
  styleUrls: ["./marketplace.component.css"],
})
export class MarketplaceComponent implements OnInit {
  // Search
  searchQuery: string = "";

  // Businesses
  businesses: BusinessDirectoryItem[] = [];
  businessesLoading: boolean = true;
  businessesError: boolean = false;

  // Featured Ads
  featuredAds: any[] = [];
  adsLoading: boolean = true;
  adsError: boolean = false;
  private allAds: any[] = [];

  // Categories
  categories: any[] = [];

  // Offers
  offers: OfferViewModel[] = [];
  offersLoading: boolean = true;
  offersError: boolean = false;

  private readonly OFFER_SOURCE_BUSINESS_LIMIT = 100;
  private readonly OFFER_DISPLAY_LIMIT = 8;

  // Icon per offer type (see ServicePricingType-style enums on BusinessOffer.offerType)
  private offerTypeIcons: { [key: number]: string } = {
    1: "local_offer", // percentage off
    2: "discount", // flat amount off
    3: "card_giftcard", // bundled / gift
    4: "restaurant", // category-specific (fallback used loosely)
  };

  // Category icon mapping
  categoryIcons: { [key: string]: string } = {
    Electronics: "devices_other",
    Automobile: "directions_car",
    Automotive: "directions_car",
    "Food & Restaurants": "restaurant",
    "Home & Living": "home",
    "Beauty & Wellness": "spa",
    Services: "handyman",
    Jobs: "work",
    "Real Estate": "business_center",
    Education: "school",
    "Health & Care": "health_and_safety",
    Music: "music_note",
  };

  // Category mapping for IDs
  categoryMapping: { [key: string]: string } = {
    "1": "Gadgets",
    "2": "Vehicles",
    "3": "Properties",
    "4": "Jobs",
    "5": "Electronics",
    "6": "Furniture",
    "7": "Books",
    "8": "Sports",
    "9": "Pets",
    "10": "Fashion",
    "11": "Commercial Services",
  };

  constructor(
    private businessService: BusinessService,
    private commonService: CommonService,
    private adminService: AdminDashboardService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
    this.fetchAds();
    this.fetchCategories();
  }

  // =========================================================
  // SEARCH
  // =========================================================

  performSearch(): void {
    if (this.searchQuery.trim().length >= 3) {
      this.router.navigate(["/search"], {
        queryParams: { q: this.searchQuery.trim() },
      });
    }
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
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });
  }

  postAdd(): void {
    if (localStorage.getItem("id") != null) {
      this.router.navigate(["/post-menu"]);
    } else {
      this.dialog.open(LoginComponent, {
        width: "400px",
        panelClass: "custom-dialog-container",
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

        // Keep top 5 for the "Popular Businesses" grid
        this.businesses = activeBusinesses.slice(0, 5);
        this.businesses.forEach((b) => {
          (b as any).rating = (4 + Math.random() * 0.8).toFixed(1);
          (b as any).reviewCount = Math.floor(Math.random() * 200) + 20;
          (b as any).establishedYear = 2015 + Math.floor(Math.random() * 10);
        });
        this.businessesLoading = false;

        this.fetchOffers(
          activeBusinesses.slice(0, this.OFFER_SOURCE_BUSINESS_LIMIT)
        );
      },
      () => {
        this.businessesError = true;
        this.businessesLoading = false;
        this.offersLoading = false;
        this.offersError = true;
      }
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
        .pipe(catchError(() => of([] as BusinessOfferDto[])))
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
      }
    );
  }

  private isOfferValid(offer: BusinessOfferDto): boolean {
    if (!offer.endDate) return true;
    return moment(offer.endDate).isSameOrAfter(moment(), "day");
  }

  private getOfferIcon(offerType: number): string {
    return this.offerTypeIcons[offerType] || "local_offer";
  }

  formatOfferValidity(endDate: string): string {
    if (!endDate) return "";
    return moment(endDate).format("DD MMM YYYY");
  }

  // =========================================================
  // FETCH FEATURED ADS
  // =========================================================

  fetchAds(): void {
    this.adsLoading = true;
    this.adsError = false;
    this.adminService.getAllItems().subscribe(
      (data: any[]) => {
        const allAds = data || [];
        const premiumAds = allAds.filter((ad) => ad.isPremium);
        this.featuredAds =
          premiumAds.length > 0 ? premiumAds : allAds.slice(0, 6);
        this.featuredAds = this.featuredAds.slice(0, 6);
        this.featuredAds.forEach((ad) => {
          ad.city = [
            "Bengaluru",
            "Mysuru",
            "Chennai",
            "Hyderabad",
            "Mumbai",
            "Delhi",
          ][Math.floor(Math.random() * 6)];
        });
        this.adsLoading = false;
        this.updateCategoryCounts();
      },
      () => {
        this.adsError = true;
        this.adsLoading = false;
      }
    );
  }

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  fetchCategories(): void {
    this.commonService.getAllCategory().subscribe(
      (data: any) => {
        this.categories = (data || []).slice(0, 8);
        this.updateCategoryCounts();
      },
      () => {}
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
        (ad) => String(ad.categoryId) === String(category.id)
      ).length;
    });
  }

  getCategoryCountLabel(category: any): string {
    const count = category?.count;
    if (count === undefined || count === null) {
      return "Loading…";
    }
    if (count === 0) {
      return "New on Marketplace";
    }
    return `${count} ${count === 1 ? "Listing" : "Listings"}`;
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
    this.router.navigate(["/business/profile", business.tabRefGUID]);
  }

  trackByBusinessId(_index: number, business: BusinessDirectoryItem): number {
    return business.id;
  }

  trackByOfferId(_index: number, offer: OfferViewModel): number {
    return offer.id;
  }

  getLocationLabel(business: BusinessDirectoryItem): string {
    const addr = business.businessAddressDto;
    if (!addr) return "";
    return [addr.area, addr.city].filter((part) => !!part).join(", ");
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return "?";
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
    const [h, m] = time.split(":").map((v) => parseInt(v, 10));
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  onBusinessImageError(event: any): void {
    event.target.style.display = "none";
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = document.createElement("div");
      placeholder.className = "card-image-placeholder";
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
    event.target.style.display = "none";
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = document.createElement("div");
      placeholder.className = "business-logo placeholder";
      const business = this.businesses.find(
        (b) => b.logoUrl === event.target.src
      );
      const initials = business ? this.getInitials(business.businessName) : "?";
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
    return "assets/image_not_available.jpg";
  }

  onAdImageError(event: any): void {
    event.target.src = "assets/image_not_available.jpg";
  }

  viewAd(ad: any): void {
    const category = this.getCategoryName(ad.categoryId);
    if (category && ad.tableRefGuid) {
      this.router.navigate([`/${category}/post-details/${ad.tableRefGuid}`]);
    }
  }

  truncateTitle(title: string, maxLength: number = 25): string {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  }

  getCategoryName(categoryId: string): string {
    return this.categoryMapping[categoryId] || "";
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
    return this.categoryIcons[categoryName] || "category";
  }

  navigateToCategory(category: any): void {
    const categoryName = category.categoryName;
    const routeMap: { [key: string]: string } = {
      Electronics: "Electronics",
      Automobile: "Vehicles",
      Automotive: "Vehicles",
      "Food & Restaurants": "Commercial Services",
      "Home & Living": "Furniture",
      "Beauty & Wellness": "Fashion",
      Services: "Commercial Services",
      Jobs: "Jobs",
      "Real Estate": "Properties",
      Education: "Commercial Services",
      "Health & Care": "Commercial Services",
    };

    const route = routeMap[categoryName] || categoryName;
    this.router.navigate([`/${route}/view-posts`], {
      queryParams: { type: route },
    });
  }
}
