import { ChangeDetectorRef, Component, ViewEncapsulation } from "@angular/core";
import { PetService } from "../../service/pet.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "src/app/shared/service/common.service";

import { GadgetType } from "src/app/shared/enum/GadgetType";
import { VehicleType } from "src/app/shared/enum/VehicleType";
import { ElectronicApplianceType } from "src/app/shared/enum/ElectronicApplianceType";
import { FurnitureType } from "src/app/shared/enum/FurnitureType";
import { SportType } from "src/app/shared/enum/SportType";
import { PetType } from "src/app/shared/enum/PetType";
import { FashionType } from "src/app/shared/enum/FashionType";
import { BookType } from "src/app/shared/enum/BookType";
import { PropertyType } from "src/app/shared/enum/PropertyType";
import { JobType } from "src/app/shared/enum/JobType";
import { CommercialServiceType } from "src/app/shared/enum/CommercialServiceType";

@Component({
  selector: "app-pet-posts",
  templateUrl: "./pet-posts.component.html",
  styleUrls: [
    "./pet-posts.component.css",
    "../../../moduleposts.component.css",
  ],
  encapsulation: ViewEncapsulation.None,
})
export class PetPostsComponent {
  category: string = "";
  subCategoryId: Number = 0;
  isLoading: boolean = true;
  showFilters: boolean = false;
  cards: any = [];
  subscription: any;
  actualCards: any;

  // ===== Category switcher state =====
  browseCategories: any[] = [];

  // ===== Sub-category switcher state =====
  activeCategorySubCategories: any[] = [];
  currentSubParam: string | null = null;

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

  // Local enum refs, used only to build the subcategory route map below
  private vehicleTypes = VehicleType;
  private gadgetsTypes = GadgetType;
  private electronicAppliancesTypes = ElectronicApplianceType;
  private furnitureTypes = FurnitureType;
  private sportTypes = SportType;
  private petTypes = PetType;
  private fashionTypes = FashionType;
  private bookTypes = BookType;
  private propertyTypes = PropertyType;
  private jobTypes = JobType;
  private commercialServicTypes = CommercialServiceType;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private petService: PetService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.isLoading = true;
      this.category = params["type"];
      this.currentSubParam = params["sub"] ?? null;
      if (params["sub"] != undefined)
        this.subCategoryId = Number(params["sub"]);
      this.getPosts();
      this.loadSubCategoriesForActiveCategory();
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

  getPosts() {
    this.cards = [];
    this.petService.getAllPetPosts().subscribe((data: any) => {
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
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  filterPosts(data: any) {
    const filterObj: { [key: string]: { operator: string; value: any } } = {};
    Object.keys(data).forEach((key) => {
      if (data[key] != null && data[key] != "") {
        if (key == "price")
          filterObj[key] = { operator: "between", value: data[key] };
        else if (
          key == "state" ||
          key == "subCategoryId" ||
          key == "city" ||
          key == "nearBy"
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

  getBrowseCategories() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.browseCategories = data;
      this.loadSubCategoriesForActiveCategory();
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

  // ===== Sub-category switcher =====

  /**
   * Finds the browseCategories entry whose routed name matches the
   * currently active `this.category`, so we know which categoryId to
   * fetch subcategories for.
   */
  private getActiveCategoryEntry(): any {
    return this.browseCategories.find(
      (c) => (this.routeMap[c.categoryName] || c.categoryName) === this.category
    );
  }

  loadSubCategoriesForActiveCategory(): void {
    const match = this.getActiveCategoryEntry();
    if (!match) {
      this.activeCategorySubCategories = [];
      return;
    }
    this.commonService
      .getSubCategoryByCategoryId(match.id)
      .subscribe((data: any) => {
        this.activeCategorySubCategories = data;
      });
  }

  getCategoryIconForSub(): string {
    return this.getActiveCategoryIcon();
  }

  isActiveSubCategory(subCategory: any): boolean {
    return (
      this.currentSubParam != null &&
      subCategory.id != null &&
      Number(this.currentSubParam) === Number(subCategory.id)
    );
  }

  clearSubCategory(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: this.category, sub: null },
      queryParamsHandling: "merge",
    });
  }

  navigateToSubCategory(subCategory: any): void {
    const match = this.getActiveCategoryEntry();
    if (!match) return;

    const routeData = this.resolveSubCategoryRoute(
      match.categoryName,
      subCategory.subCategoryName
    );

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: routeData.type, sub: routeData.sub },
      queryParamsHandling: "merge",
    });
  }

  /**
   * Same mapping logic previously used in the (now retired) header
   * component, kept local to this component since nothing else needs it.
   */
  private resolveSubCategoryRoute(
    categoryName: string,
    subCategoryName: string
  ): { type: string; sub: any } {
    const categoryRoutes: { [key: string]: { [key: string]: any } } = {
      Vehicles: {
        Cars: { type: "Vehicles", sub: this.vehicleTypes.Car },
        Bikes: { type: "Vehicles", sub: this.vehicleTypes.Bike },
        Scooty: { type: "Vehicles", sub: this.vehicleTypes.Scooty },
        Bicycle: { type: "Vehicles", sub: this.vehicleTypes.Bicycle },
        "Spare parts": { type: "Vehicles", sub: this.vehicleTypes.SpareParts },
        Others: { type: "Vehicles", sub: this.vehicleTypes.Others },
      },
      Gadgets: {
        Mobiles: { type: "Gadgets", sub: this.gadgetsTypes.Mobiles },
        Tablets: { type: "Gadgets", sub: this.gadgetsTypes.Tablets },
        Accessories: { type: "Gadgets", sub: this.gadgetsTypes.Accessories },
        Others: { type: "Gadgets", sub: this.gadgetsTypes.Others },
      },
      Properties: {
        "For Sale: Houses & Apartments": {
          type: "Properties",
          sub: this.propertyTypes.ForSaleHousesApartments,
        },
        "For Rent: Houses & Apartments": {
          type: "Properties",
          sub: this.propertyTypes.ForRentHousesApartments,
        },
        "Lands & Plot": {
          type: "Properties",
          sub: this.propertyTypes.LandsAndPlot,
        },
        "For Rent: Shop & Offices": {
          type: "Properties",
          sub: this.propertyTypes.ForRentShopOffices,
        },
        "For Sale: Shops & Offices": {
          type: "Properties",
          sub: this.propertyTypes.ForSaleShopsOffices,
        },
        "PG & Guest Houses": {
          type: "Properties",
          sub: this.propertyTypes.PGAndGuestHouses,
        },
        Others: { type: "Properties", sub: this.propertyTypes.Others },
      },
      Jobs: {
        "Data Entry & Back Office": {
          type: "Jobs",
          sub: this.jobTypes.DataEntryAndBackOffice,
        },
        "Media & Entertainment": {
          type: "Jobs",
          sub: this.jobTypes.MediaEntertainment,
        },
        "Sales & Marketting": {
          type: "Jobs",
          sub: this.jobTypes.SalesAndMarketting,
        },
        "BPO & Telecaller": {
          type: "Jobs",
          sub: this.jobTypes.BPOAndTelecaller,
        },
        "Health Care & Hospitility": {
          type: "Jobs",
          sub: this.jobTypes.HealthCareAndHospitility,
        },
        "Office Assistant": {
          type: "Jobs",
          sub: this.jobTypes.OfficeAssistant,
        },
        "Retail & Store Jobs": {
          type: "Jobs",
          sub: this.jobTypes.RetailAndStore,
        },
        "Delivery & Collection": {
          type: "Jobs",
          sub: this.jobTypes.DeliveryAndCollection,
        },
        Teacher: { type: "Jobs", sub: this.jobTypes.TeacherAndTrainer },
        "Cook,driver & security": {
          type: "Jobs",
          sub: this.jobTypes.CookAndDriverAndSecurity,
        },
        "Receptionist & Front Office": {
          type: "Jobs",
          sub: this.jobTypes.ReceptionistAndFrontOffice,
        },
        "Operator & Technician": {
          type: "Jobs",
          sub: this.jobTypes.OperatorAndTechnician,
        },
        "IT & Software": { type: "Jobs", sub: this.jobTypes.ITAndSoftware },
        "Hotel & Travel": { type: "Jobs", sub: this.jobTypes.HotelAndTravel },
        Accountant: { type: "Jobs", sub: this.jobTypes.FinanceAndAccounting },
        Others: { type: "Jobs", sub: this.jobTypes.Others },
      },
      Electronics: {
        TV: { type: "Electronics", sub: this.electronicAppliancesTypes.TV },
        Kitchen: {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.Kitchen,
        },
        "Computer & Laptop": {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.Computer,
        },
        "Camera & Lenses": {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.Camera,
        },
        "Games & Entertainment": {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.GamesEntertainment,
        },
        Refrigrator: {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.Refrigrator,
        },
        "Computer Accessories": {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.ComputerAccessories,
        },
        AC: { type: "Electronics", sub: this.electronicAppliancesTypes.AC },
        "Washing Machine": {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.WashingMachine,
        },
        Others: {
          type: "Electronics",
          sub: this.electronicAppliancesTypes.Others,
        },
      },
      Furniture: {
        "Sofa & Dining": {
          type: "Furniture",
          sub: this.furnitureTypes.SofaAndDining,
        },
        Beds: { type: "Furniture", sub: this.furnitureTypes.Beds },
        "Kids Furniture": {
          type: "Furniture",
          sub: this.furnitureTypes.KidsFurniture,
        },
        Others: {
          type: "Furniture",
          sub: this.furnitureTypes.OtherHouseholdItems,
        },
      },
      Books: {
        "Science & Technology": {
          type: "Books",
          sub: this.bookTypes.ScienceAndTechnology,
        },
        "Business & Management": {
          type: "Books",
          sub: this.bookTypes.BusinessAndManagement,
        },
        "School & College": {
          type: "Books",
          sub: this.bookTypes.SchoolAndCollege,
        },
        Competative: { type: "Books", sub: this.bookTypes.Competative },
        Art: { type: "Books", sub: this.bookTypes.Art },
        Others: { type: "Books", sub: this.bookTypes.Others },
      },
      Sports: {
        "Gym & Fitness": {
          type: "Sports",
          sub: this.sportTypes.GymAndFitness,
        },
        "Musical Instruments": {
          type: "Sports",
          sub: this.sportTypes.MusicalInstruments,
        },
        "Sports Equipment": {
          type: "Sports",
          sub: this.sportTypes.SportsEquipment,
        },
        Others: { type: "Sports", sub: this.sportTypes.OtherHobbies },
      },
      Pets: {
        "Fishes & Aquarium": {
          type: "Pets",
          sub: this.petTypes.FishesAndAquarium,
        },
        "Pet Food & Accessories": {
          type: "Pets",
          sub: this.petTypes.PetFoodAndAccessories,
        },
        Dogs: { type: "Pets", sub: this.petTypes.Dogs },
        Others: { type: "Pets", sub: this.petTypes.OtherPets },
      },
      Fashion: {
        Men: { type: "Fashion", sub: this.fashionTypes.Men },
        Women: { type: "Fashion", sub: this.fashionTypes.Women },
        Kids: { type: "Fashion", sub: this.fashionTypes.Kids },
        Others: { type: "Fashion", sub: this.fashionTypes.Men },
      },
      "Commercial Services": {
        "Finance & Management": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.FinanceAndManagement,
        },
        "Education & Classess": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.EducationAndClassess,
        },
        "IT & Software": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.ITAndSoftware,
        },
        "Tour & Travel": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.TourAndTravel,
        },
        "Sales & Marketting": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.SalesAndMarketting,
        },
        "Electronics Repair & Services": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.ElectronicsRepairAndServices,
        },
        "Security & Cleaning": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.SecurityAndCleaning,
        },
        "Health & Beauty": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.HealthAndBeauty,
        },
        "Kids & Child care": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.KidsAndChildcare,
        },
        "Property & Repair": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.PropertyAndRepair,
        },
        "Video & Photograpghy": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.VedioAndPhotograpghy,
        },
        "Legal & Documentation Service": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.LegalAndDocumentaionService,
        },
        "Packers & Movers": {
          type: "Commercial Services",
          sub: this.commercialServicTypes.PackersAndMovers,
        },
        Others: {
          type: "Commercial Services",
          sub: this.commercialServicTypes.Others,
        },
      },
    };

    const defaultSubCategory = { type: categoryName, sub: "Others" };
    return (
      categoryRoutes[categoryName]?.[subCategoryName] || defaultSubCategory
    );
  }

  searchQuery: string = "";

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input ? input.value : "";
  }

  performSearch(): void {
    const main = document.querySelector(".cp-main");
    if (main) {
      main.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  clearSearch(): void {
    this.searchQuery = "";
  }

  get displayedCards(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.cards;

    return this.cards.filter((card: any) => {
      const haystack = [
        card.title,
        card.brand,
        card.model,
        card.description,
        card.city,
        card.state,
        card.pincode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }
}
