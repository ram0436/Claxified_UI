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

  showAllBusinesses: boolean = false;

  isAdmin: boolean = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private businessService: BusinessService
  ) {}

  private businessUpdatedSub!: Subscription;

  ngOnInit() {
    if (localStorage.getItem("authToken") != null) {
      this.isUserLogedIn = true;
      this.isAdmin = localStorage.getItem("role") === "Admin";
      this.loadUserBusinesses();
    }

    this.businessUpdatedSub = this.businessService.businessUpdated$.subscribe(
      (update) => {
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

  goToAttributeMapping(): void {
    this.router.navigate(["/business/admin/attribute-mapping"]);
  }

  loadUserBusinesses(): void {
    const userId = Number(localStorage.getItem("id"));
    if (!userId) return;

    this.businessService.getUserBusinesses(userId).subscribe(
      (businesses: BusinessListItem[]) => {
        this.businesses = businesses || [];
        // reset expansion state whenever the list is (re)loaded
        this.showAllBusinesses = false;
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

  // NEW: toggles between showing 3 businesses and showing all of them
  toggleShowAllBusinesses(event: Event): void {
    event.stopPropagation(); // prevent the mat-menu-item click from closing the menu
    this.showAllBusinesses = !this.showAllBusinesses;
  }

  getInitials(name: string): string {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    const initials =
      words.length === 1 ? words[0].substring(0, 2) : words[0][0] + words[1][0];
    return initials.toUpperCase();
  }

  avatarGradient(name: string): string {
    const gradients = [
      "linear-gradient(135deg, #0d475c 0%, #1f9254 100%)",
      "linear-gradient(135deg, #e75462 0%, #f4a261 100%)",
      "linear-gradient(135deg, #6c5ce7 0%, #0065ff 100%)",
      "linear-gradient(135deg, #00b894 0%, #0d475c 100%)",
      "linear-gradient(135deg, #e75462 0%, #6c5ce7 100%)",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  switchBusiness(biz: BusinessListItem): void {
    const tabRefGuid = biz.businessId;
    if (!tabRefGuid) {
      return;
    }
    this.currentBusinessName = biz.businessName;
    if (biz.logoUrl && biz.logoUrl.trim() !== "") {
      this.currentBusinessLogo = biz.logoUrl;
    }
    this.router.navigate(["/business/profile", tabRefGuid]);
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
      this.showAllBusinesses = false;
      this.router.navigate(["/"]);
    }
  }
}
