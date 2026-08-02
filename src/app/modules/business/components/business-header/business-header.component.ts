import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { BusinessLoginComponent } from "../business-login/business-login.component";
import { LoginComponent } from "src/app/modules/user/component/login/login.component";
import { BusinessService } from "../../service/business.service";
import { BusinessListItem } from "./../../model/Business";
import { Subscription } from "rxjs";

@Component({
  selector: "app-business-header",
  templateUrl: "./business-header.component.html",
  styleUrls: ["./business-header.component.css"],
})
export class BusinessHeaderComponent implements OnInit, OnDestroy {
  dialogRef!: MatDialogRef<BusinessLoginComponent>;
  loginDialogRef!: MatDialogRef<LoginComponent>;

  isUserLogedIn: boolean = false;
  userData: any;
  isSlideVisible = false;
  expandIconVisible: boolean = true;

  businesses: BusinessListItem[] = [];
  currentBusinessName: string = "My Business";
  currentBusinessLogo: string =
    "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg";

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private businessService: BusinessService
  ) {}

  private businessUpdatedSub!: Subscription;

  ngOnInit() {
    if (localStorage.getItem("authToken") != null) {
      this.isUserLogedIn = true;
      this.loadUserBusinesses();
    }

    this.businessUpdatedSub = this.businessService.businessUpdated$.subscribe(
      (update) => {
        // Update the matching entry in the businesses list
        const match = this.businesses.find(
          (b) =>
            b.businessId === update.businessId ||
            (b as any).id === update.businessId
        );
        if (match) {
          match.businessName = update.businessName;
          if (update.logoUrl) {
            match.logoUrl = update.logoUrl;
          }
        }

        // If it's the currently displayed business, update the header UI immediately
        const isCurrentlyShown =
          this.businesses.length > 0 &&
          (this.businesses[0].businessId === update.businessId ||
            (this.businesses[0] as any).id === update.businessId);

        if (isCurrentlyShown || this.businesses.length === 0) {
          this.currentBusinessName = update.businessName;
          if (update.logoUrl && update.logoUrl.trim() !== "") {
            this.currentBusinessLogo = update.logoUrl;
          }
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.businessUpdatedSub) {
      this.businessUpdatedSub.unsubscribe();
    }
  }

  loadUserBusinesses(): void {
    const userId = Number(localStorage.getItem("id"));
    if (!userId) return;

    this.businessService.getUserBusinesses(userId).subscribe(
      (businesses: BusinessListItem[]) => {
        this.businesses = businesses || [];
        if (this.businesses.length > 0) {
          this.currentBusinessName = this.businesses[0].businessName;
          if (
            this.businesses[0].logoUrl &&
            this.businesses[0].logoUrl.trim() !== ""
          ) {
            this.currentBusinessLogo = this.businesses[0].logoUrl;
          }
        }
      },
      (error) => {}
    );
  }

  toggleExpandIcon(): void {
    this.expandIconVisible = !this.expandIconVisible;
  }

  openLoginModal() {
    if (this.isSlideVisible) {
      this.isSlideVisible = !this.isSlideVisible;
    }
    if (this.loginDialogRef) {
      this.loginDialogRef.close();
    }
    this.loginDialogRef = this.dialog.open(LoginComponent, {
      width: "400px",
      panelClass: "custom-dialog-container",
    });

    const dialogRefElement = document.querySelector(".custom-dialog-container");
    if (dialogRefElement) {
      dialogRefElement.setAttribute("style", "margin-top: 50px");
    }

    this.loginDialogRef.afterClosed().subscribe(() => {
      if (localStorage.getItem("authToken") != null) {
        this.isUserLogedIn = true;
        this.loadUserBusinesses();
      }
    });
  }

  openBusinessLoginModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.dialogRef = this.dialog.open(BusinessLoginComponent, {
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });
    this.dialogRef.afterClosed().subscribe(() => {});
  }

  goToBusinessDashboard() {
    this.router.navigate(["/business/dashboard"]);
  }
  goToBusinessProfile() {
    this.router.navigate(["/business/profile"]);
  }
  goToListing() {
    this.router.navigate(["/business/listing"]);
  }
  goToAnalytics() {
    this.router.navigate(["/business/analytics"]);
  }
  goToLead() {
    this.router.navigate(["/business/lead"]);
  }
  goToOwnerProfile() {
    this.router.navigate(["/user/account/personal"]);
  }
  goToMyBusiness() {
    this.router.navigate(["/business/profile"]);
  }
  goToAccountSettings() {
    this.router.navigate(["/business/account-settings"]);
  }

  logout() {
    if (localStorage.getItem("authToken") != null) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("userId");
      this.isUserLogedIn = false;
      this.businesses = [];
      this.router.navigate(["/"]);
    }
  }
}
