import { Component, OnInit, HostListener, ElementRef } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { UserService } from "src/app/modules/user/service/user.service";
import { LoginComponent } from "../../../modules/user/component/login/login.component";
import { SignupComponent } from "../../../modules/user/component/signup/signup.component";
import { GadgetType } from "../../enum/GadgetType";
import { VehicleType } from "../../enum/VehicleType";
import { ElectronicApplianceType } from "../../enum/ElectronicApplianceType";
import { FurnitureType } from "../../enum/FurnitureType";
import { MatIconModule } from "@angular/material/icon";
import { SportType } from "../../enum/SportType";
import { PetType } from "../../enum/PetType";
import { FashionType } from "../../enum/FashionType";
import { BookType } from "../../enum/BookType";
import { PropertyType } from "../../enum/PropertyType";
import { JobType } from "../../enum/JobType";
import { CommercialServiceType } from "../../enum/CommercialServiceType";
import { Location } from "@angular/common";
import { AdminDashboardService } from "src/app/modules/admin/service/admin-dashboard.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonService } from "../../service/common.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  searchQuery: string = "";
  locationSearchQuery: string = "";
  searchResults: any[] = [];
  allItems: any[] = [];

  isSlideVisible = false;

  mainCategories: any = [];
  subCategories: any = [];

  expandIconVisible: boolean = true;
  vehicleTypes = VehicleType;
  gadgetsTypes = GadgetType;
  ElectronicAppliancesTypes = ElectronicApplianceType;
  furnitureTypes = FurnitureType;
  sportTypes = SportType;
  petTypes = PetType;
  fashionTypes = FashionType;
  bookTypes = BookType;
  propertyTypes = PropertyType;
  jobTypes = JobType;
  commercialServicTypes = CommercialServiceType;
  isUserLogedIn: boolean = false;
  userData: any;
  imageUrl: string =
    "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg";
  dialogRef: MatDialogRef<any> | null = null;
  isAdmin: boolean = false;
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private location: Location,
    private AdminDashboardService: AdminDashboardService,
    private snackBar: MatSnackBar,
    private elRef: ElementRef,
    private commonService: CommonService
  ) {
    this.userService.getData().subscribe((data) => {
      var role = localStorage.getItem("role");
      if (role != null && role == "Admin") this.isAdmin = true;
      else this.isAdmin = false;
    });
  }

  hideSecondNav = false;

  // Function to handle the scroll event
  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    // Adjust the value (e.g., 200) based on when you want the effect to trigger
    this.hideSecondNav = scrollPosition > 0;
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: Event) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isSlideVisible = false;
    }
  }

  reloadApp() {
    // Navigate to the root route (you can replace this with your desired route)
    this.router.navigate(["/"]);

    // Trigger a hard reload of the application
    this.location.replaceState("/");
    window.location.reload();
  }

  toggleSlideVisibility() {
    this.isSlideVisible = !this.isSlideVisible;
  }

  generateGadgetsLink(subCategory?: GadgetType) {
    if (subCategory) {
      return "/Gadgets/view-posts?type=Gadget&sub=" + subCategory;
    } else {
      return "/Gadgets/view-posts?type=Gadget";
    }
  }

  generateQueryParams() {
    const queryParams = {
      type: "Gadget",
      sub: [
        this.gadgetsTypes.Mobiles,
        this.gadgetsTypes.Tablets,
        this.gadgetsTypes.Accessories,
      ],
    };

    return queryParams;
  }

  clearSearchText(): void {
    this.searchQuery = "";
  }

  clearLocationSearchText(): void {
    this.locationSearchQuery = "";
  }

  getAllItems(): void {
    this.AdminDashboardService.getAllItems().subscribe(
      (allItems: any[]) => {
        this.allItems = allItems;
      },
      (error) => {}
    );
  }

  getAllCategory() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.mainCategories = data;
      this.mainCategories.forEach((category: any) =>
        this.getSubCategory(category)
      );
    });
  }

  getSubCategory(mainCategory: any) {
    this.commonService
      .getSubCategoryByCategoryId(mainCategory.id)
      .subscribe((data: any) => {
        mainCategory.subCategories = data;
      });
  }

  getMaterialIconForCategory(categoryName: string): string {
    if (categoryName === "Gadgets") {
      return "devices_other";
    } else if (categoryName === "Vehicles") {
      return "directions_car_filled";
    } else if (categoryName === "Properties") {
      return "maps_home_work";
    } else if (categoryName === "Jobs") {
      return "work_outline";
    } else if (categoryName === "\r\nElectronics") {
      return "tv";
    } else if (categoryName === "Furnitures") {
      return "bed";
    } else if (categoryName === "Books") {
      return "auto_stories";
    } else if (categoryName === "Sports") {
      return "sports_soccer";
    } else if (categoryName === "Pets") {
      return "cruelty_free";
    } else if (categoryName === "Fashion") {
      return "watch";
    } else if (categoryName === "Commercial Services") {
      return "electrical_services";
    }
    return "devices_other";
  }

  getRouterLinkForCategory(categoryName: any) {
    if (categoryName === "\r\nElectronics") {
      this.router.navigate([`/Electronics & Appliances/view-posts`], {
        queryParams: { type: "Appliances" },
      });
    } else if (categoryName === "Furnitures") {
      this.router.navigate([`/Furniture/view-posts`], {
        queryParams: { type: "Furniture" },
      });
    } else if (categoryName === "Sports") {
      this.router.navigate([`/Sports & Hobbies/view-posts`], {
        queryParams: { type: "Sport" },
      });
    } else {
      this.router.navigate([`${categoryName}/view-posts`], {
        queryParams: { type: `${categoryName}` },
      });
    }
  }

  getRouterLinkForSubCategory(categoryName: any, subCategoryName: any) {
    if (categoryName === "Vehicles") {
      switch (subCategoryName) {
        case "Cars":
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Car },
          });
          break;
        case "Bikes":
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Bike },
          });
          break;
        case "Scooty":
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Scooty },
          });
          break;
        case "Bicycle":
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Bicycle },
          });
          break;
        case "Spare parts":
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.vehicleTypes.SpareParts,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Others },
          });
          break;
        default:
          this.router.navigate(["/Vehicles/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Others },
          });
      }
    } else if (categoryName === "Gadgets") {
      switch (subCategoryName) {
        case "Mobiles":
          this.router.navigate(["/Gadgets/view-posts"], {
            queryParams: { type: categoryName, sub: this.gadgetsTypes.Mobiles },
          });
          break;
        case "Tablets":
          this.router.navigate(["/Gadgets/view-posts"], {
            queryParams: { type: categoryName, sub: this.gadgetsTypes.Tablets },
          });
          break;
        case "Accessories":
          this.router.navigate(["/Gadgets/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.gadgetsTypes.Accessories,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Gadgets/view-posts"], {
            queryParams: { type: categoryName, sub: this.gadgetsTypes.Others },
          });
          break;
        default:
          this.router.navigate(["/Gadgets/view-posts"], {
            queryParams: { type: categoryName, sub: this.vehicleTypes.Others },
          });
      }
    } else if (categoryName === "Properties") {
      switch (subCategoryName) {
        case "For Sale: Houses & Apartments":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.propertyTypes.ForSaleHousesApartments,
            },
          });
          break;
        case "For Rent: Houses & Apartments":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.propertyTypes.ForRentHousesApartments,
            },
          });
          break;
        case "Lands & Plot":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.propertyTypes.LandsAndPlot,
            },
          });
          break;
        case "For Rent: Shop & Offices":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.propertyTypes.ForRentShopOffices,
            },
          });
          break;
        case "For Sale: Shops & Offices":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.propertyTypes.ForSaleShopsOffices,
            },
          });
          break;
        case "PG & Guest Houses":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.propertyTypes.PGAndGuestHouses,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: { type: categoryName, sub: this.propertyTypes.Others },
          });
          break;
        default:
          this.router.navigate(["/Properties/view-posts"], {
            queryParams: { type: categoryName, sub: this.propertyTypes.Others },
          });
      }
    } else if (categoryName === "Jobs") {
      switch (subCategoryName) {
        case "Data Entry & Back Office":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.DataEntryAndBackOffice,
            },
          });
          break;
        case "Media & Entertainment":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.MediaEntertainment,
            },
          });
          break;
        case "Sales & Marketting":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.SalesAndMarketting,
            },
          });
          break;
        case "BPO & Telecaller":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.BPOAndTelecaller,
            },
          });
          break;
        case "Health Care & Hospitility":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.HealthCareAndHospitility,
            },
          });
          break;
        case "Office Assistant":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.OfficeAssistant,
            },
          });
          break;
        case "Delivery & Collection":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.DeliveryAndCollection,
            },
          });
          break;
        case "Teacher":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.TeacherAndTrainer,
            },
          });
          break;
        case "Cook,driver & security":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.CookAndDriverAndSecurity,
            },
          });
          break;
        case "Receptionist & Front Office":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.ReceptionistAndFrontOffice,
            },
          });
          break;
        case "Operator & Technician":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.OperatorAndTechnician,
            },
          });
          break;
        case "IT & Software":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.ITAndSoftware,
            },
          });
          break;
        case "Hotel & Travel":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.HotelAndTravel,
            },
          });
          break;
        case "Accountant":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.FinanceAndAccounting,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.jobTypes.Others,
            },
          });
          break;
        default:
          this.router.navigate(["/Jobs/view-posts"], {
            queryParams: { type: categoryName, sub: this.jobTypes.Others },
          });
      }
    } else if (categoryName === "\r\nElectronics") {
      switch (subCategoryName) {
        case "TV":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.TV,
            },
          });
          break;
        case "Kitchen":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Kitchen,
            },
          });
          break;
        case "Computer & Laptop":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Computer,
            },
          });
          break;
        case "Cameras & Lenses":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Camera,
            },
          });
          break;
        case "Games & Entertainment":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.GamesEntertainment,
            },
          });
          break;
        case "Refrigrator":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Refrigrator,
            },
          });
          break;
        case "Computer Accessories":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.ComputerAccessories,
            },
          });
          break;
        case "AC":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.AC,
            },
          });
          break;
        case "Washing Machine":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.WashingMachine,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Others,
            },
          });
          break;
        default:
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Others,
            },
          });
      }
    } else if (categoryName === "Furnitures") {
      switch (subCategoryName) {
        case "Sofa & Dining":
          this.router.navigate(["/Furniture/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.furnitureTypes.SofaAndDining,
            },
          });
          break;
        case "Beds":
          this.router.navigate(["/Furniture/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.furnitureTypes.Beds,
            },
          });
          break;
        case "Kids Furniture":
          this.router.navigate(["/Furniture/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.furnitureTypes.KidsFurniture,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Furniture/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.furnitureTypes.OtherHouseholdItems,
            },
          });
          break;
          this.router.navigate(["/Electronics & Appliances/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.ElectronicAppliancesTypes.Others,
            },
          });
          break;
        default:
          this.router.navigate(["/Furniture/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.furnitureTypes.OtherHouseholdItems,
            },
          });
      }
    } else if (categoryName === "Books") {
      switch (subCategoryName) {
        case "Science & Technology":
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.ScienceAndTechnology,
            },
          });
          break;
        case "Business & Management":
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.BusinessAndManagement,
            },
          });
          break;
        case "School & College":
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.SchoolAndCollege,
            },
          });
          break;
        case "Competative":
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.Competative,
            },
          });
          break;
        case "Art":
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.Art,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.Others,
            },
          });
          break;
        default:
          this.router.navigate(["/Books/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.bookTypes.Others,
            },
          });
      }
    } else if (categoryName === "Sports") {
      switch (subCategoryName) {
        case "Gym & Fitness":
          this.router.navigate(["/Sports & Hobbies/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.sportTypes.GymAndFitness,
            },
          });
          break;
        case "Musical Instruments":
          this.router.navigate(["/Sports & Hobbies/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.sportTypes.MusicalInstruments,
            },
          });
          break;
        case "Sports Equipment":
          this.router.navigate(["/Sports & Hobbies/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.sportTypes.SportsEquipment,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Sports & Hobbies/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.sportTypes.OtherHobbies,
            },
          });
          break;
        default:
          this.router.navigate(["/Sports & Hobbies/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.sportTypes.OtherHobbies,
            },
          });
      }
    } else if (categoryName === "Pets") {
      switch (subCategoryName) {
        case "Fishes & Aquarium":
          this.router.navigate(["/Pets/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.petTypes.FishesAndAquarium,
            },
          });
          break;
        case "Pet Food & Accessories":
          this.router.navigate(["/Pets/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.petTypes.PetFoodAndAccessories,
            },
          });
          break;
        case "Dogs":
          this.router.navigate(["/Pets/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.petTypes.Dogs,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Pets/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.petTypes.OtherPets,
            },
          });
          break;
        default:
          this.router.navigate(["/Pets/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.petTypes.OtherPets,
            },
          });
      }
    } else if (categoryName === "Fashion") {
      switch (subCategoryName) {
        case "Men":
          this.router.navigate(["/Fashion/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.fashionTypes.Men,
            },
          });
          break;
        case "Women":
          this.router.navigate(["/Fashion/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.fashionTypes.Women,
            },
          });
          break;
        case "Kids":
          this.router.navigate(["/Fashion/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.fashionTypes.Kids,
            },
          });
          break;
        default:
          this.router.navigate(["/Fashion/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.fashionTypes.Men,
            },
          });
      }
    } else if (categoryName === "Commercial Services") {
      switch (subCategoryName) {
        case "Finance & Management":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.FinanceAndManagement,
            },
          });
          break;
        case "Education & Classess":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.EducationAndClassess,
            },
          });
          break;
        case "IT & Software":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.ITAndSoftware,
            },
          });
          break;
        case "Tour & Travel":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.TourAndTravel,
            },
          });
          break;
        case "Sales & Marketting":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.SalesAndMarketting,
            },
          });
          break;
        case "Electronics Repair & Services":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.ElectronicsRepairAndServices,
            },
          });
          break;
        case "Security & Cleaning":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.SecurityAndCleaning,
            },
          });
          break;
        case "Health & Beauty":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.HealthAndBeauty,
            },
          });
          break;
        case "Kids & Child care":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.KidsAndChildcare,
            },
          });
          break;
        case "Property & Repair":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.PropertyAndRepair,
            },
          });
          break;
        case "Video & Photograpghy":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.VedioAndPhotograpghy,
            },
          });
          break;
        case "Legal & Documentation Service":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.LegalAndDocumentaionService,
            },
          });
          break;
        case "Packers & Movers":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.PackersAndMovers,
            },
          });
          break;
        case "Others":
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.Others,
            },
          });
          break;
        default:
          this.router.navigate(["/Commercial Services/view-posts"], {
            queryParams: {
              type: categoryName,
              sub: this.commercialServicTypes.Others,
            },
          });
      }
    } else {
      this.router.navigate(["/"]);
    }
  }

  search(): void {
    if (
      (this.searchQuery && this.searchQuery.length >= 3) ||
      (this.locationSearchQuery && this.locationSearchQuery.length >= 3)
    ) {
      this.AdminDashboardService.searchAds(
        this.searchQuery,
        this.locationSearchQuery
      ).subscribe(
        (results: any[]) => {
          this.searchResults = results;
        },
        (error) => {}
      );
    } else {
      this.showNotification("Search query should have at least 3 characters");
    }
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  ngOnInit() {
    if (localStorage.getItem("authToken") != null) {
      this.isUserLogedIn = true;
      this.getUserData();
    }
    this.userService.getData().subscribe((data) => {
      this.getUserData();
    });
    var role = localStorage.getItem("role");
    if (role != null && role == "Admin") this.isAdmin = true;
    else this.isAdmin = false;
    this.getAllCategory();
  }

  openLoginModal() {
    if (this.isSlideVisible) {
      this.isSlideVisible = !this.isSlideVisible;
    }

    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(LoginComponent, {
      width: "400px",
      panelClass: "custom-dialog-container",
    });

    const dialogRefElement = document.querySelector(".custom-dialog-container");
    if (dialogRefElement) {
      dialogRefElement.setAttribute("style", "margin-top: 50px");
    }

    this.dialogRef.afterClosed().subscribe((result) => {
      if (localStorage.getItem("authToken") != null) this.isUserLogedIn = true;
    });
  }
  openSignUpModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(SignupComponent, { width: "500px" });

    this.dialogRef.afterClosed().subscribe((result) => {
      this.isUserLogedIn = false;
    });
  }
  logout() {
    if (this.isSlideVisible) {
      this.isSlideVisible = !this.isSlideVisible;
    }
    if (localStorage.getItem("authToken") != null) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("userId");
      this.isUserLogedIn = false;
      this.router.navigate(["/"]);
    }
  }
  getUserData() {
    if (localStorage.getItem("id") != null) {
      this.userService
        .getUserById(Number(localStorage.getItem("id")))
        .subscribe((userData: any) => {
          this.userData = userData[0];
          if (this.userData.userImageList.length > 0) {
            this.imageUrl =
              this.userData.userImageList[
                this.userData.userImageList.length - 1
              ].imageURL;
          }
        });
    }
  }

  toggleExpandIcons(): void {
    this.expandIconVisible = !this.expandIconVisible;
  }
  postAdd() {
    if (localStorage.getItem("id") != null)
      this.router.navigate(["/post-menu"]);
    else this.openLoginModal();
  }
}
