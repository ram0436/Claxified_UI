import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from "src/app/shared/service/common.service";

interface QuickCategory {
  icon: string;
  label: string;
  route: string;
  colorClass: string;
}

interface AdCategory {
  id: number;
  icon: string;
  name: string;
  count: number;
  colorClass: string;
  route: string;
}

interface ClassifiedAd {
  id: string;
  title: string;
  price: string;
  category: string;
  categoryIcon: string;
  location: string;
  postedAgo: string;
  imageUrl?: string;
  colorClass: string;
  isWishlisted?: boolean;
}

interface WhyItem {
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: "app-classified-ads-home",
  templateUrl: "./classified-ads-home.component.html",
  styleUrls: ["./classified-ads-home.component.css"],
})
export class ClassifiedAdsHomeComponent implements OnInit {
  // Search
  searchQuery: string = "";

  adsLoading: boolean = true;
  adsError: boolean = false;

  categoriesLoading: boolean = true;
  categoriesError: boolean = false;

  quickCategories: QuickCategory[] = [
    {
      icon: "smartphone",
      label: "Mobiles",
      route: "/Electronics/view-posts",
      colorClass: "c-indigo",
    },
    {
      icon: "directions_car",
      label: "Cars",
      route: "/Vehicles/view-posts",
      colorClass: "c-red",
    },
    {
      icon: "two_wheeler",
      label: "Bikes",
      route: "/Vehicles/view-posts",
      colorClass: "c-pink",
    },
    {
      icon: "home",
      label: "Property",
      route: "/Properties/view-posts",
      colorClass: "c-green",
    },
    {
      icon: "work",
      label: "Jobs",
      route: "/Jobs/view-posts",
      colorClass: "c-blue",
    },
    {
      icon: "weekend",
      label: "Furniture",
      route: "/Furniture/view-posts",
      colorClass: "c-orange",
    },
    {
      icon: "more_horiz",
      label: "More",
      route: "/categories",
      colorClass: "c-neutral",
    },
  ];

  // Fetched from CommonService.getAllCategory() — no more hardcoded list
  browseCategories: AdCategory[] = [];

  // Fetched from CommonService.getAllItems()
  featuredAds: ClassifiedAd[] = [];

  // Latest Ads is commented out for now (see fetchAds() and the template)
  latestAds: ClassifiedAd[] = [];

  whyItems: WhyItem[] = [
    {
      icon: "grade",
      title: "100% Free to Post",
      subtitle: "Post unlimited ads for free",
    },
    {
      icon: "diversity_3",
      title: "Reach Local Buyers",
      subtitle: "Connect with real people near you",
    },
    {
      icon: "shield",
      title: "Safe & Secure",
      subtitle: "Your safety is our priority",
    },
    {
      icon: "schedule",
      title: "Quick & Easy",
      subtitle: "Post in minutes and start selling",
    },
    {
      icon: "workspace_premium",
      title: "Better Deals",
      subtitle: "Find great deals on everything",
    },
  ];

  private readonly FEATURED_LIMIT = 8;

  // Cycled for categories/ads that don't have an explicit color
  private readonly categoryColorClasses: string[] = [
    "c-indigo",
    "c-red",
    "c-pink",
    "c-green",
    "c-blue",
    "c-orange",
    "c-purple",
    "c-teal",
  ];

  // Category name -> Material icon (purely presentational; API doesn't send icons)
  private readonly categoryIconMap: { [key: string]: string } = {
    "Mobiles & Tablets": "smartphone",
    Mobiles: "smartphone",
    Cars: "directions_car",
    Vehicles: "directions_car",
    Bikes: "two_wheeler",
    Property: "home",
    "Real Estate": "home",
    Jobs: "work",
    Furniture: "weekend",
    "Home & Kitchen": "kitchen",
    Electronics: "devices_other",
    Fashion: "checkroom",
    Books: "menu_book",
    Sports: "sports_soccer",
    Pets: "pets",
    "Commercial Services": "handyman",
  };

  // Category name -> route segment, mirrors the pattern used elsewhere in the app
  private readonly categoryRouteMap: { [key: string]: string } = {
    "Mobiles & Tablets": "Electronics",
    Mobiles: "Electronics",
    Electronics: "Electronics",
    Cars: "Vehicles",
    Bikes: "Vehicles",
    Vehicles: "Vehicles",
    Property: "Properties",
    "Real Estate": "Properties",
    Jobs: "Jobs",
    Furniture: "Furniture",
    "Home & Kitchen": "Furniture",
    Fashion: "Fashion",
    "Commercial Services": "Commercial Services",
  };

  // Map of the *ImageList fields present on a Dashboard/GetAll item, in priority order
  private readonly imageListKeys: string[] = [
    "gadgetImageList",
    "vehicleImageList",
    "propertyImageList",
    "jobImageList",
    "electronicApplianceImageList",
    "furnitureImageList",
    "bookImageList",
    "sportImageList",
    "petImageList",
    "fashionImageList",
    "commercialServiceImageList",
  ];

  private allAds: any[] = []; // raw cached items, used to (re)compute category counts

  constructor(private router: Router, private commonService: CommonService) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchAds();
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
        queryParams: { q: this.searchQuery.trim(), type: "ads" },
      });
    }
  }

  // =========================================================
  // FETCH CATEGORIES (CommonService.getAllCategory)
  // =========================================================

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = false;
    this.commonService.getAllCategory().subscribe(
      (data: any) => {
        const list = data || [];
        this.browseCategories = list.map((c: any) => {
          const name = c.name || c.categoryName || "Category";
          return {
            id: c.id ?? c.categoryId,
            icon: this.categoryIconMap[name] || "category",
            name,
            count: 0,
            colorClass:
              this.categoryColorClasses[
                (c.id ?? 0) % this.categoryColorClasses.length
              ],
            route: this.categoryRouteMap[name] || name,
          } as AdCategory;
        });
        this.categoriesLoading = false;
        this.updateCategoryCounts();
      },
      () => {
        this.categoriesError = true;
        this.categoriesLoading = false;
      }
    );
  }

  /** Counts active items per category once both categories and ads have loaded. */
  private updateCategoryCounts(): void {
    if (!this.browseCategories.length || !this.allAds.length) return;
    this.browseCategories.forEach((category) => {
      category.count = this.allAds.filter(
        (item) => item.categoryId === category.id
      ).length;
    });
  }

  // =========================================================
  // FETCH ADS (CommonService.getAllItems)
  // =========================================================

  fetchAds(): void {
    this.adsLoading = true;
    this.adsError = false;
    this.commonService.getAllItems().subscribe(
      (data: any) => {
        const list: any[] = (data || []).filter((item: any) => item.isActive);
        this.allAds = list;

        const premium = list.filter((item) => item.isPremium);
        const featuredSource = (premium.length ? premium : list).slice(
          0,
          this.FEATURED_LIMIT
        );
        this.featuredAds = featuredSource.map((item, i) =>
          this.mapItemToAd(item, i)
        );

        // Latest Ads is disabled for now — see template. Re-enable by uncommenting
        // the block below once the section is unhidden.
        // this.latestAds = list.slice(0, this.FEATURED_LIMIT).map((item, i) => this.mapItemToAd(item, i));

        this.adsLoading = false;
        this.updateCategoryCounts();
      },
      () => {
        this.adsError = true;
        this.adsLoading = false;
      }
    );
  }

  private mapItemToAd(item: any, index: number): ClassifiedAd {
    const category = this.browseCategories.find(
      (c) => c.id === item.categoryId
    );
    return {
      id: item.tableRefGuid || String(item.id),
      title: item.title || "Untitled",
      price: this.formatPrice(item),
      category: category?.name || "General",
      categoryIcon: category?.icon || "category",
      location:
        [item.city, item.state].filter(Boolean).join(", ") ||
        item.pincode ||
        "",
      postedAgo: this.getPostedAgo(item.createdOn),
      imageUrl: this.getFirstImageUrl(item),
      colorClass:
        category?.colorClass ||
        this.categoryColorClasses[index % this.categoryColorClasses.length],
      isWishlisted: false,
    };
  }

  private getFirstImageUrl(item: any): string | undefined {
    for (const key of this.imageListKeys) {
      const list = item[key];
      if (list && list.length && list[0]?.imageURL) {
        return list[0].imageURL;
      }
    }
    return undefined;
  }

  private formatPrice(item: any): string {
    if (item.price) {
      return `₹${Number(item.price).toLocaleString("en-IN")}`;
    }
    if (item.minSalary || item.maxSalary) {
      // NOTE: assuming salaryPeriodType 2 = yearly, otherwise monthly — confirm against your enum.
      const period = item.salaryPeriodType === 2 ? "/year" : "/month";
      if (item.minSalary && item.maxSalary) {
        return `₹${Number(item.minSalary).toLocaleString("en-IN")} - ₹${Number(
          item.maxSalary
        ).toLocaleString("en-IN")}${period}`;
      }
      return `₹${Number(item.minSalary || item.maxSalary).toLocaleString(
        "en-IN"
      )}${period}`;
    }
    return "Price on request";
  }

  private getPostedAgo(createdOn: string): string {
    if (!createdOn) return "";
    const diffMs = Date.now() - new Date(createdOn).getTime();
    const diffMins = Math.max(Math.floor(diffMs / 60000), 0);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  trackByCategoryId(_index: number, category: AdCategory): number {
    return category.id;
  }

  trackByAdId(_index: number, ad: ClassifiedAd): string {
    return ad.id;
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToCategory(category: AdCategory | QuickCategory): void {
    const route = "route" in category ? category.route : category;
    this.router.navigate([`/${route}/view-posts`], {
      queryParams: { type: route },
    });
  }

  viewAd(ad: ClassifiedAd): void {
    this.router.navigate(["/ad-details", ad.id]);
  }

  postAdd(): void {
    if (localStorage.getItem("id") != null) {
      this.router.navigate(["/post-menu"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }

  toggleWishlist(ad: ClassifiedAd, event: Event): void {
    event.stopPropagation();
    ad.isWishlisted = !ad.isWishlisted;
    // TODO: persist wishlist state via the real ads/wishlist service.
  }
}
