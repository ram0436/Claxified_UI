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
    } else if (categoryName === "Electronics") {
      return "tv";
    } else if (categoryName === "Furniture") {
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
    this.router.navigate([`${categoryName}/view-posts`], {
      queryParams: { type: `${categoryName}` },
    });
  }

  getRouterLinkForSubCategory(categoryName: string, subCategoryName: string) {
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
        TV: {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.TV,
        },
        Kitchen: {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.Kitchen,
        },
        "Computer & Laptop": {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.Computer,
        },
        "Camera & Lenses": {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.Camera,
        },
        "Games & Entertainment": {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.GamesEntertainment,
        },
        Refrigrator: {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.Refrigrator,
        },
        "Computer Accessories": {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.ComputerAccessories,
        },
        AC: {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.AC,
        },
        "Washing Machine": {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.WashingMachine,
        },
        Others: {
          type: "Electronics",
          sub: this.ElectronicAppliancesTypes.Others,
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

    const routeData =
      categoryRoutes[categoryName]?.[subCategoryName] || defaultSubCategory;
    const route = `/${categoryName}/view-posts`;

    this.router.navigate([route], {
      queryParams: { type: routeData.type, sub: routeData.sub },
    });
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
