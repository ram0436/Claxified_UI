import { Component } from "@angular/core";
import { ApplianceService } from "../../service/appliance.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { LoginComponent } from "../../../user/component/login/login.component";
import { SignupComponent } from "../../../user/component/signup/signup.component";
import { CommonService } from "src/app/shared/service/common.service";
import { Location } from "@angular/common";
import { UserService } from "src/app/modules/user/service/user.service";
import { AdsReportType } from "src/app/shared/enum/AdsReportType";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AdminDashboardService } from "src/app/modules/admin/service/admin-dashboard.service";

@Component({
  selector: "app-post-details",
  templateUrl: "./post-details.component.html",
  styleUrls: ["./post-details.component.css", "../../../module.component.css"],
})
export class PostDetailsComponent {
  postDetails: any;
  isPhoneNumberHidden = true;
  isUserLogedIn: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;
  post: any;
  imagesList: any = [];
  isLoading: boolean = true;
  currentDate: Date = new Date();
  imageIndex: number = 0;
  relatedPosts: any = [
    {
      title: "Iphonr 10",
      price: 15000,
      state: "Telangana",
      city: "Hyderabad",
      nearBy: "Erragadda",
      imageUrl:
        "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Iphonr 11",
      price: 25000,
      state: "Telangana",
      city: "Hyderabad",
      nearBy: "Moosapet",
      imageUrl:
        "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Iphonr 12",
      price: 35000,
      state: "Telangana",
      city: "Hyderabad",
      nearBy: "Ameerpet",
      imageUrl:
        "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Iphonr 13",
      price: 45000,
      state: "Telangana",
      city: "Hyderabad",
      nearBy: "Punjagutta",
      imageUrl:
        "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Iphonr 14",
      price: 55000,
      state: "Telangana",
      city: "Hyderabad",
      nearBy: "Ameerpet",
      imageUrl:
        "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Iphonr 15",
      price: 65000,
      state: "Telangana",
      city: "Hyderabad",
      nearBy: "Punjagutta",
      imageUrl:
        "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    },
  ];
  itemsPerPage = 4;
  currentPage = 0;
  isZoomed: boolean = false;

  reporterClicked = false;

  iconName = "arrow_drop_down";

  isFavorite: boolean = false;

  showReportOptions: boolean = false;
  currentSlideIndex = 0;
  carouselItems = [
    "Beware of buyers asking to use 'Claxified delivery' or 'Payments on Claxified' for anything",
    "Access Claxified portal from claxified.com and do not follow links sent by other users",
    "Share photos and ask lots of questions about the items you are buying and selling",
    "Don't reply to email addresses hidden in text and pictures",
    "Use the 'Report ad' button if something found illegal/unethical",
  ];
  mainCategories: any = [];
  subCategories: any = [];

  reportDetail: string = "";
  adsReportType: AdsReportType = AdsReportType.Others;
  adTabRefGuid: string = "";
  showSuccessMessage: boolean = false;
  selectedRadioValue: number | null = null;
  showOptionWarning: boolean = false;

  productId: string = "";
  categoryId: string = "";
  favoriteStatus: { [key: string]: boolean } = {};

  isAdmin: boolean = false;

  constructor(
    private electronicApplianceService: ApplianceService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private commonService: CommonService,
    private location: Location,
    private UserService: UserService,
    private snackBar: MatSnackBar,
    private AdminDashboardService: AdminDashboardService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.adTabRefGuid = params.get("id") || "";
    });
  }
  verifyAdd(categoryId: number, tableRefGuid: string): void {
    if (this.isAdmin) {
      this.route.queryParams.subscribe((params) => {
        this.AdminDashboardService.verifyAd(categoryId, tableRefGuid).subscribe(
          (response: any) => {
            this.adVerifiedNotification("Ad verified successfully");
          },
          (error: any) => {
            this.adVerifiedNotification("Cannot verify this ad");
          }
        );
      });
    }
  }

  adVerifiedNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
    this.router.navigateByUrl("/Admin/admin-dashboard");
  }

  ngOnInit() {
    var role = localStorage.getItem("role");
    if (role != null && role == "Admin") this.isAdmin = true;
    else this.isAdmin = false;
    this.getMainCategories();
    setTimeout(() => this.getSubCategory(this.postDetails.categoryId), 1000);
    var tableRefGuid;
    this.route.paramMap.subscribe((params) => {
      tableRefGuid = params.get("id");
    });
    if (tableRefGuid != null) {
      this.getElectronicAppliancePost(tableRefGuid);
    }
  }

  setAdsReportType(value: number) {
    this.adsReportType = value;
    this.handleRadioSelection(value);
  }

  handleRadioSelection(value: number) {
    if (this.selectedRadioValue === value) {
      this.selectedRadioValue = null;
    } else {
      this.selectedRadioValue = value;
    }
  }

  sendReport() {
    const isRadioButtonSelected = this.selectedRadioValue !== null;
    // const isReportDetailProvided = this.reportDetail && this.reportDetail.trim().length > 0;

    this.showOptionWarning = false;
    // this.showDetailWarning = false;

    if (!isRadioButtonSelected) {
      this.showOptionWarning = true;
      return;
    }

    const userId = localStorage.getItem("id");

    const reportPayload = {
      id: 0,
      adTabRefGuid: this.adTabRefGuid,
      adsReportType: this.adsReportType,
      reportDetail: this.reportDetail,
      createdBy: localStorage.getItem("id"),
      createdOn: new Date().toISOString(),
    };

    this.UserService.AdReportByUser(reportPayload).subscribe(
      (response: any) => {
        this.reportDetail = "";
        this.selectedRadioValue = null;
        this.toggleReportOptions();

        // this.showSuccessMessage = true;
        // setTimeout(() => {
        //   this.showSuccessMessage = false;
        // }, 3000);
        this.showNotification("Your report has been successfully submitted.");
      },
      (error: any) => {
        // Handle error response, if needed
        // console.error('Error sending report:', error);
      }
    );
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  toggleReportOptions() {
    if (localStorage.getItem("id") != null) {
      this.showReportOptions = !this.showReportOptions;
      this.reporterClicked = !this.reporterClicked;
      this.iconName = this.showReportOptions
        ? "arrow_drop_up"
        : "arrow_drop_down";
      this.showOptionWarning = false;
      // this.showDetailWarning = false;
      this.selectedRadioValue = null;
      this.reportDetail = "";
    } else {
      this.openLoginModal();
    }
  }

  toggleFavorite(event: Event, productId: string, categoryId: string) {
    event.preventDefault();
    event.stopPropagation();

    if (localStorage.getItem("id") != null) {
      // Check if the card has a favorite status, if not, set it to false
      this.favoriteStatus[productId] = this.favoriteStatus[productId] || false;

      // Toggle the favorite status for the specific card
      this.favoriteStatus[productId] = !this.favoriteStatus[productId];

      if (this.favoriteStatus[productId]) {
        this.addToWishlist(productId, categoryId);
      } else {
        // Remove from wishlist API call (if applicable)
        // Implement this method if you have a remove from wishlist functionality
      }
    } else {
      this.openLoginModal();
    }
  }

  addToWishlist(productId: string, categoryId: string) {
    const wishlistItem = {
      id: 0,
      productId: productId,
      categoryId: categoryId,
      createdBy: localStorage.getItem("id"),
      createdOn: new Date().toISOString(),
    };

    this.UserService.AddWishList(wishlistItem).subscribe(
      (response: any) => {
        // Handle success response, if needed
      },
      (error: any) => {
        console.error("Error adding to Wishlist:", error);
      }
    );
  }

  // toggleFavorite(event: Event) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.isFavorite = !this.isFavorite;
  // }

  formatPrice(price: number): string {
    const roundedPrice = Math.round(price);

    const formattedPrice = roundedPrice.toLocaleString("en-IN");

    return formattedPrice;
  }

  prevItem() {
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.carouselItems.length) %
      this.carouselItems.length;
    this.updateButtonState();
  }

  nextItem() {
    this.currentSlideIndex =
      (this.currentSlideIndex + 1) % this.carouselItems.length;
    this.updateButtonState();
  }

  updateButtonState() {
    const isFirstItem = this.currentSlideIndex === 0;
    const isLastItem = this.currentSlideIndex === this.carouselItems.length - 1;

    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");

    if (prevButton) {
      prevButton.classList.toggle("disabled", isFirstItem);
    }

    if (nextButton) {
      nextButton.classList.toggle("disabled", isLastItem);
    }
  }

  // toggleReportOptions() {
  //   this.showReportOptions = !this.showReportOptions;
  //   this.reporterClicked = !this.reporterClicked;
  //   this.iconName = this.showReportOptions ? 'arrow_drop_up' : 'arrow_drop_down';
  // }

  zoomIn() {
    this.isZoomed = !this.isZoomed;

    // Toggle a class to style the expanded image
    const imgElement = document.querySelector(".postImgCont");
    if (imgElement) {
      imgElement.classList.toggle("zoomed");
    }
  }

  closeZoom() {
    this.isZoomed = false;
    const imgElement = document.querySelector(".postImgCont");
    if (imgElement) {
      imgElement.classList.remove("zoomed");
    }
  }

  goBack() {
    // this.router.navigate(['/Electronics & Appliances/view-posts'], {
    //   queryParams: {
    //     type: 'Appliances',
    //     sub: 34
    //   }
    // });
    this.location.back();
  }

  getElectronicAppliancePost(guid: any) {
    this.electronicApplianceService
      .getElectronicAppliancePostByGuid(guid)
      .subscribe((data: any) => {
        this.postDetails = data[0];
        this.isLoading = false;
        this.imagesList = this.postDetails.electronicApplianceImageList;
      });
  }
  formatDate(date: any): any {
    const inputDate: Date = new Date(date);
    const daysAgo = moment(this.currentDate).diff(inputDate, "days");

    if (daysAgo >= 0 && daysAgo <= 7) {
      if (daysAgo === 0) {
        return "Today";
      } else if (daysAgo === 1) {
        return "Yesterday";
      } else {
        return daysAgo + " days ago";
      }
    } else {
      return moment(inputDate).format("MMM DD");
    }
  }
  showPrevious() {
    this.imageIndex = this.imageIndex - 1;
  }
  showNext() {
    this.imageIndex = this.imageIndex + 1;
  }
  handleNext(): void {
    if (
      this.currentPage <
      Math.ceil(this.relatedPosts.length / this.itemsPerPage) - 1
    ) {
      this.currentPage++;
    }
  }

  handlePrev(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  get displayedItems(): any[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.relatedPosts.slice(start, end);
  }

  openLoginModal() {
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

    this.dialogRef.afterClosed().subscribe((result) => {
      if (localStorage.getItem("authToken") != null) this.isUserLogedIn = true;
    });
  }

  revealPhoneNumber() {
    if (localStorage.getItem("id") != null)
      this.isPhoneNumberHidden = !this.isPhoneNumberHidden;
    else this.openLoginModal();
  }
  getMainCategoryName(id: number) {
    let mainCategory = this.mainCategories.find((cat: any) => cat.id == id);
    return mainCategory != null ? mainCategory.categoryName : "";
  }
  getSubCategoryName(id: number) {
    let subCategory = this.subCategories.find((cat: any) => cat.id == id);
    return subCategory != null ? subCategory.subCategoryName : "";
  }
  getMainCategories() {
    this.commonService.getAllCategory().subscribe((res) => {
      this.mainCategories = res;
    });
  }
  getSubCategory(id: number) {
    this.commonService.getSubCategoryByCategoryId(id).subscribe((res) => {
      this.subCategories = res;
    });
  }
}
