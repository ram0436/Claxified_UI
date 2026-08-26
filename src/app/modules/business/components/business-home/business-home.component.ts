import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { BusinessService } from "../../service/business.service";
import { BusinessDirectoryItem, BusinessOfferDto } from "../../model/Business";
import { BusinessLoginComponent } from "../business-login/business-login.component";
import { CommonService } from "src/app/shared/service/common.service";

// Local view-model so the template doesn't need to reach into raw DTO fields
interface OfferViewModel extends BusinessOfferDto {
  businessName: string;
}

@Component({
  selector: "app-business-home",
  templateUrl: "./business-home.component.html",
  styleUrls: ["./business-home.component.css"],
})
export class BusinessHomeComponent implements OnInit {
  // Search
  searchQuery: string = "";

  // Businesses
  businesses: BusinessDirectoryItem[] = [];
  businessesLoading: boolean = true;
  businessesError: boolean = false;
  private allActiveBusinesses: BusinessDirectoryItem[] = []; // full list, used for category counts + offer sourcing

  // Top Rated Businesses
  // NOTE: disabled for now — this was mock data with no backing API.
  // Re-enable fetchTopRatedBusinesses() (see below) once a real endpoint
  // (e.g. businesses sorted/filtered by rating) is available.
  topRatedBusinesses: any[] = [];

  // Categories — fetched from BusinessService, counts derived from live business data
  businessCategories: any[] = [];
  categoriesLoading: boolean = true;
  categoriesError: boolean = false;
  categoryDisplayLimit: number = 10;

  // Offers — fetched via Business/offers per businessId, no longer hardcoded
  offers: OfferViewModel[] = [];
  offersLoading: boolean = true;
  offersError: boolean = false;

  private readonly OFFER_SOURCE_BUSINESS_LIMIT = 100;
  private readonly OFFER_DISPLAY_LIMIT = 6;

  // Cycles through the offer badge colors, in the same order the offers render
  offerColors: string[] = [
    "#F0544E",
    "#F0954B",
    "#6C4CE0",
    "#4C6FE0",
    "#E93D82",
  ];
  offerBgColors: string[] = [
    "#FDECEA",
    "#FFF0E3",
    "#EFE9FE",
    "#EAF0FF",
    "#FDE9F2",
  ];

  // Category icon mapping (purely presentational — maps a category name to a
  // Material icon; not a source of business data)
  categoryIcons: { [key: string]: string } = {
    "Real Estate": "business_center",
    "Home Services": "handyman",
    Education: "school",
    "Health & Care": "health_and_safety",
    Automotive: "directions_car",
    Electronics: "devices_other",
    "Beauty & Wellness": "spa",
    "Food & Restaurants": "restaurant",
    Music: "music_note",
    Fitness: "fitness_center",
    Photography: "photo_camera",
    Legal: "gavel",
  };

  constructor(
    private businessService: BusinessService,
    private commonService: CommonService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
    this.fetchCategories();
    // this.fetchTopRatedBusinesses(); // disabled — mock data, no backing API yet
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.searchQuery = input.value;
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim().length >= 3) {
      this.router.navigate(["/search"], {
        queryParams: { q: this.searchQuery.trim(), type: "business" },
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

        this.allActiveBusinesses = activeBusinesses;
        this.businesses = activeBusinesses.slice(0, 6);
        this.businesses.forEach((b) => {
          (b as any).rating = (4 + Math.random() * 0.8).toFixed(1);
          (b as any).reviewCount = Math.floor(Math.random() * 200) + 20;
          (b as any).establishedYear = 2015 + Math.floor(Math.random() * 10);
        });
        this.businessesLoading = false;

        this.fetchOffers(
          activeBusinesses.slice(0, this.OFFER_SOURCE_BUSINESS_LIMIT)
        );
        this.updateCategoryCounts();
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
  // FETCH CATEGORIES (BusinessService, not hardcoded)
  // =========================================================

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = false;
    this.businessService.getBusinessCategories().subscribe(
      (data: any) => {
        // Normalize whatever shape the API returns ({id, name} or
        // {id, categoryName}) into a consistent local shape.
        this.businessCategories = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name || c.categoryName,
          count: undefined as number | undefined, // filled in by updateCategoryCounts()
        }));
        this.categoriesLoading = false;

        this.updateCategoryCounts();
      },
      () => {
        this.categoriesError = true;
        this.categoriesLoading = false;
      }
    );
  }

  /**
   * Counts active businesses per category by matching businessCategoryId.
   * This page is specifically about *business* categories, so (unlike the
   * classified-ads marketplace view) matching against businessCategoryId
   * is correct here. Order-independent: called from both fetchBusinesses()
   * and fetchCategories() since either may resolve first.
   */
  private updateCategoryCounts(): void {
    if (!this.businessCategories.length || !this.allActiveBusinesses.length) {
      return;
    }
    this.businessCategories.forEach((category: any) => {
      category.count = this.allActiveBusinesses.filter(
        (b) => b.businessCategoryId === category.id
      ).length;
    });
  }

  getCategoryCountLabel(category: any): string {
    const count = category?.count;
    if (count === undefined || count === null) {
      return "Loading…";
    }
    if (count === 0) {
      return "New on Claxified";
    }
    return `${count} ${count === 1 ? "Business" : "Businesses"}`;
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
      }
    );
  }

  private isOfferValid(offer: BusinessOfferDto): boolean {
    if (!offer.endDate) return true;
    return new Date(offer.endDate).getTime() >= new Date().setHours(0, 0, 0, 0);
  }

  trackByOfferId(_index: number, offer: OfferViewModel): number {
    return offer.id;
  }

  // =========================================================
  // FETCH TOP RATED BUSINESSES
  // =========================================================
  // Disabled: this was mock/demo data, not sourced from any API. Uncomment
  // and wire up to a real endpoint (e.g. businesses sorted by rating, or a
  // dedicated "top-rated" endpoint) when one exists.
  //
  // fetchTopRatedBusinesses(): void {
  //   this.topRatedBusinesses = [
  //     {
  //       businessName: "The Baker's Den",
  //       category: "Bakery",
  //       rating: 4.8,
  //       reviewCount: 120,
  //     },
  //     {
  //       businessName: "Nature's Basket",
  //       category: "Grocery Store",
  //       rating: 4.7,
  //       reviewCount: 95,
  //     },
  //     {
  //       businessName: "Laptop World",
  //       category: "Electronics Store",
  //       rating: 4.6,
  //       reviewCount: 88,
  //     },
  //     {
  //       businessName: "Blossom Salon",
  //       category: "Beauty Salon",
  //       rating: 4.7,
  //       reviewCount: 132,
  //     },
  //     {
  //       businessName: "Axis Physiotherapy",
  //       category: "Physiotherapy Center",
  //       rating: 4.8,
  //       reviewCount: 101,
  //     },
  //     {
  //       businessName: "Green Leaf Cafe",
  //       category: "Cafe",
  //       rating: 4.6,
  //       reviewCount: 76,
  //     },
  //   ];
  //   this.topRatedBusinesses.forEach((b, index) => {
  //     (b as any).logoUrl = null;
  //   });
  // }

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

  getBusinessPhone(business: BusinessDirectoryItem): string {
    const b = business as any;
    return b.contactNumber || b.phoneNumber || b.mobileNumber || "";
  }

  getWhatsAppLink(business: BusinessDirectoryItem): string {
    const phone = this.getBusinessPhone(business).replace(/[^\d]/g, "");
    return phone ? `https://wa.me/${phone}` : "";
  }

  // =========================================================
  // CATEGORY HELPERS
  // =========================================================

  getCategoryIcon(categoryName: string): string {
    return this.categoryIcons[categoryName] || "category";
  }

  navigateToCategory(category: any): void {
    const routeMap: { [key: string]: string } = {
      "Real Estate": "Properties",
      "Home Services": "Commercial Services",
      Education: "Commercial Services",
      "Health & Care": "Commercial Services",
      Automotive: "Vehicles",
      Electronics: "Electronics",
      "Beauty & Wellness": "Fashion",
      "Food & Restaurants": "Commercial Services",
    };

    const route = routeMap[category.name] || category.name;
    this.router.navigate([`/${route}/view-posts`], {
      queryParams: { type: route },
    });
  }

  // =========================================================
  // OFFER HELPERS
  // =========================================================

  // Pulls a short badge ("20%", "Flat", "₹200") out of the offer title so the
  // circular badge in the card always has something concise to show.
  getOfferBadge(title: string): { value: string; suffix: string } {
    if (!title) return { value: "OFFER", suffix: "" };
    const percentMatch = title.match(/(\d+)\s*%/);
    if (percentMatch) {
      return { value: `${percentMatch[1]}%`, suffix: "OFF" };
    }
    const flatMatch = title.match(/₹\s*([\d,]+)/);
    if (flatMatch) {
      return { value: `₹${flatMatch[1]}`, suffix: "OFF" };
    }
    return { value: "FREE", suffix: "" };
  }

  getOfferColor(index: number): string {
    return this.offerColors[index % this.offerColors.length];
  }

  getOfferBgColor(index: number): string {
    return this.offerBgColors[index % this.offerBgColors.length];
  }

  openBusinessLoginModal(): void {
    this.dialog.open(BusinessLoginComponent, {
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });
  }
}
