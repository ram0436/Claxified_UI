import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { CommonService } from "src/app/shared/service/common.service";
import { UserService } from "src/app/modules/user/service/user.service";
import { LoginComponent } from "src/app/modules/user/component/login/login.component";
import {
  CATEGORY_MAPPING,
  getCategoryRoute,
  WishlistItem,
} from "../../model/ads";

interface AdCategory {
  id: number;
  icon: string;
  name: string;
  count: number;
  colorClass: string;
  route: string;
}

interface ClassifiedAd {
  id: string; // tableRefGuid
  categoryId: string; // raw categoryId, needed for wishlist + routing
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

interface TrustStat {
  icon: string;
  value: string;
  label: string;
}

interface TrustItem {
  icon: string;
  title: string;
  subtitle: string;
  colorClass: string;
}

@Component({
  selector: "app-classified-ads-home",
  templateUrl: "./classified-ads-home.component.html",
  styleUrls: ["./classified-ads-home.component.css"],
})
export class ClassifiedAdsHomeComponent implements OnInit {
  searchQuery: string = "";

  adsLoading: boolean = true;
  adsError: boolean = false;

  categoriesLoading: boolean = true;
  categoriesError: boolean = false;

  isUserLogedIn: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;

  browseCategories: AdCategory[] = [];
  mappedAds: ClassifiedAd[] = [];

  private readonly ADS_PER_LOAD = 10;
  visibleAdsCount: number = this.ADS_PER_LOAD;

  trustStats: TrustStat[] = [
    { icon: "verified", value: "10K+", label: "Active Ads" },
    { icon: "location_city", value: "500+", label: "Cities Covered" },
    { icon: "diversity_3", value: "25K+", label: "Happy Users" },
    { icon: "bolt", value: "100%", label: "Free to Post" },
  ];

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

  trustItems: TrustItem[] = [
    {
      icon: "verified_user",
      title: "Trusted & Verified",
      subtitle: "Verified businesses you can trust",
      colorClass: "c-purple",
    },
    {
      icon: "sell",
      title: "Great Deals",
      subtitle: "Find the best deals near you",
      colorClass: "c-pink",
    },
    {
      icon: "shield",
      title: "Safe & Secure",
      subtitle: "Your safety is our top priority",
      colorClass: "c-orange",
    },
    {
      icon: "support_agent",
      title: "24/7 Support",
      subtitle: "We're here to help you anytime",
      colorClass: "c-green",
    },
    {
      icon: "smartphone",
      title: "Easy to Use",
      subtitle: "Simple, fast and seamless experience",
      colorClass: "c-indigo",
    },
  ];

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

  private rawAds: any[] = [];

  constructor(
    private router: Router,
    private commonService: CommonService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchAds();
  }

  // ===================== SEARCH =====================

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input ? input.value : "";
    this.visibleAdsCount = this.ADS_PER_LOAD;
  }

  performSearch(): void {
    this.visibleAdsCount = this.ADS_PER_LOAD;
    const adsSection = document.getElementById("ads-section");
    if (adsSection) {
      adsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  clearSearch(): void {
    this.searchQuery = "";
    this.visibleAdsCount = this.ADS_PER_LOAD;
  }

  get filteredAds(): ClassifiedAd[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.mappedAds;
    return this.mappedAds.filter(
      (ad) =>
        ad.title.toLowerCase().includes(q) ||
        ad.category.toLowerCase().includes(q) ||
        ad.location.toLowerCase().includes(q)
    );
  }

  get displayedAds(): ClassifiedAd[] {
    return this.filteredAds.slice(0, this.visibleAdsCount);
  }

  get hasMoreAds(): boolean {
    return this.visibleAdsCount < this.filteredAds.length;
  }

  loadMore(): void {
    this.visibleAdsCount += this.ADS_PER_LOAD;
  }

  // ===================== FETCH CATEGORIES =====================

  // Category icon mapping
  categoryIcons: { [key: string]: string } = {
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

  getCategoryIcon(categoryName: string): string {
    return this.categoryIcons[categoryName] || "category";
  }

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = false;
    this.commonService.getAllCategory().subscribe(
      (data: any) => {
        const list = data || [];
        this.browseCategories = list.map((c: any) => {
          const name =
            c.name || c.categoryName || CATEGORY_MAPPING[c.id] || "Category";
          return {
            id: c.id ?? c.categoryId,
            icon: this.categoryIconMap[name] || "category",
            name,
            count: 0,
            colorClass:
              this.categoryColorClasses[
                (c.id ?? 0) % this.categoryColorClasses.length
              ],
            route:
              this.categoryRouteMap[name] || getCategoryRoute(c.id) || name,
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

  private updateCategoryCounts(): void {
    if (!this.browseCategories.length || !this.rawAds.length) return;
    this.browseCategories.forEach((category) => {
      category.count = this.rawAds.filter(
        (item) => item.categoryId === category.id
      ).length;
    });
  }

  // ===================== FETCH ADS =====================

  fetchAds(): void {
    this.adsLoading = true;
    this.adsError = false;
    this.commonService.getAllItems().subscribe(
      (data: any) => {
        const list: any[] = (data || []).filter((item: any) => item.isActive);
        this.rawAds = list;

        const sorted = [...list].sort(
          (a, b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0)
        );
        this.mappedAds = sorted.map((item, i) => this.mapItemToAd(item, i));

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
      categoryId: item.categoryId,
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

  // ===================== WISHLIST =====================

  toggleWishlist(ad: ClassifiedAd, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (localStorage.getItem("id") == null) {
      this.openLoginModal();
      return;
    }

    ad.isWishlisted = !ad.isWishlisted;

    if (ad.isWishlisted) {
      this.addToWishlist(ad.id, ad.categoryId);
    }
  }

  private addToWishlist(productId: string, categoryId: string): void {
    const wishlistItem: WishlistItem = {
      id: 0,
      productId,
      categoryId,
      createdBy: localStorage.getItem("id"),
      createdOn: new Date().toISOString(),
    };

    this.userService.AddWishList(wishlistItem).subscribe(
      () => {},
      () => {}
    );
  }

  openLoginModal(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(LoginComponent, {
      width: "400px",
      panelClass: "custom-dialog-container",
    });

    const dialogRefElement = document.querySelector(".custom-dialog-container");
    if (dialogRefElement) {
      dialogRefElement.setAttribute("style", "margin-top: 85px");
    }

    this.dialogRef.afterClosed().subscribe(() => {
      if (localStorage.getItem("authToken") != null) this.isUserLogedIn = true;
    });
  }

  // ===================== NAVIGATION =====================

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToCategory(category: AdCategory): void {
    this.router.navigate([`/${category.route}/view-posts`], {
      queryParams: { type: category.route },
    });
  }

  /** Mirrors PostCardComponent's routerLink: /:category/post-details/:tableRefGuid */
  viewAd(ad: ClassifiedAd): void {
    const categoryRoute = getCategoryRoute(ad.categoryId);
    this.router.navigate([`/${categoryRoute}/post-details/${ad.id}`]);
  }

  postAdd(): void {
    if (localStorage.getItem("id") != null) {
      this.router.navigate(["/post-menu"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }
}
