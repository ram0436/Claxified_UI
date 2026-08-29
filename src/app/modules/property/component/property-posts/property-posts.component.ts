import { ChangeDetectorRef, Component, HostListener } from "@angular/core";
import { PropertyService } from "../../service/property.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "src/app/shared/service/common.service";

@Component({
  selector: "app-property-posts",
  templateUrl: "./property-posts.component.html",
  styleUrls: [
    "./property-posts.component.css",
    "../../../moduleposts.component.css",
  ],
})
export class PropertyPostsComponent {
  category: string = "";
  subCategoryId: Number = 0;
  isLoading: boolean = true;
  showFilters: boolean = false;
  cards: any = [];
  subscription: any;
  actualCards: any;

  // ===== Category switcher state =====
  browseCategories: any[] = [];

  routeMap: { [key: string]: string } = {
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

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.isLoading = true;
      this.category = params["type"];
      if (params["sub"] != undefined)
        this.subCategoryId = Number(params["sub"]);
      this.getPosts();
    });
    this.subscription = this.commonService.getData().subscribe((data: any) => {
      this.isLoading = true;
      setTimeout(() => this.filterPosts(data), 500);
    });
    this.getBrowseCategories();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onResetClicked() {
    this.showFilters = false;
  }
  // getPosts() {
  //   this.cards = [];
  //   this.propertyService.getAllPropertyPosts().subscribe((data: any) => {
  //     this.actualCards = data;
  //     if (this.subCategoryId != 0){
  //       this.cards = this.actualCards.filter((card: any) => card.subCategoryId == this.subCategoryId).map((card: any) => ({
  //         ...card,
  //         title: this.truncateTitle(card.title)
  //       }));
  //     }
  //     else{
  //       this.cards = this.actualCards.map((card: any) => ({
  //         ...card,
  //         title: this.truncateTitle(card.title)
  //       }));
  //     }

  //     this.isLoading = false;
  //     this.subCategoryId = 0;
  //   })
  // }

  getPosts() {
    this.cards = [];
    this.propertyService.getAllPropertyPosts().subscribe((data: any) => {
      this.actualCards = data;
      if (this.subCategoryId != 0) {
        this.cards = this.actualCards.filter(
          (card: any) =>
            card.subCategoryId == this.subCategoryId && card.isVerified === true
        );
      } else {
        this.cards = this.actualCards.filter(
          (card: any) => card.isVerified === true
        );
      }
      this.isLoading = false;
      this.subCategoryId = 0;
    });
  }

  truncateTitle(title: string, maxLength: number = 25): string {
    if (title.length <= maxLength) {
      return title;
    } else {
      return title.substring(0, maxLength) + "...";
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  filterPosts(data: any) {
    const filterObj: { [key: string]: { operator: string; value: any } } = {};
    Object.keys(data).forEach((key) => {
      if (data[key] != null && data[key] != "") {
        if (key == "price" || key == "superBuildUpArea" || key == "plotArea")
          filterObj[key] = { operator: "between", value: data[key] };
        else if (
          key == "state" ||
          key == "subCategoryId" ||
          key == "city" ||
          key == "nearBy" ||
          key == "bedrooms" ||
          key == "bathrooms" ||
          key == "bachelorAllowed"
        )
          filterObj[key] = { operator: "==", value: data[key] };
        else filterObj[key] = { operator: "includes", value: data[key] };
      }
    });
    const filteredData = this.actualCards.filter((item: any) =>
      Object.entries(filterObj).every(([field, condition]) => {
        const { operator, value } = condition;
        const itemValue = item[field];

        if (Array.isArray(itemValue) && operator === "includes") {
          return itemValue.some((v) => value.includes(v));
        } else {
          switch (operator) {
            case "==":
              return item[field] === value;
            case "<=":
              return item[field] <= value;
            case "includes":
              return value.includes(itemValue);
            case "between":
              return value[0] <= itemValue && value[1] >= itemValue;
            default:
              return true;
          }
        }
      })
    );
    this.cards = [];
    this.cards = filteredData.filter((card: any) => card.isVerified === true);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // ===== Category switcher =====

  getBrowseCategories() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.browseCategories = data;
    });
  }

  getCategoryIcon(categoryName: string): string {
    return this.categoryIcons[categoryName] || "category";
  }

  isActiveCategory(category: any): boolean {
    const route = this.routeMap[category.categoryName] || category.categoryName;
    return route === this.category;
  }

  navigateToCategory(category: any): void {
    const categoryName = category.categoryName;
    const route = this.routeMap[categoryName] || categoryName;
    this.router.navigate([`classified-ads/${route}/view-posts`], {
      queryParams: { type: route },
    });
  }

  getActiveCategoryIcon(): string {
    const match = this.browseCategories.find(
      (c) => (this.routeMap[c.categoryName] || c.categoryName) === this.category
    );
    return match ? this.getCategoryIcon(match.categoryName) : "category";
  }
}
