import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/modules/user/service/user.service';
import { LoginComponent } from '../../../modules/user/component/login/login.component';
import { SignupComponent } from '../../../modules/user/component/signup/signup.component';
import { GadgetType } from '../../enum/GadgetType';
import { VehicleType } from '../../enum/VehicleType';
import { ElectronicApplianceType } from '../../enum/ElectronicApplianceType';
import { FurnitureType } from '../../enum/FurnitureType';
import { MatIconModule } from '@angular/material/icon';
import { SportType } from '../../enum/SportType';
import { PetType } from '../../enum/PetType';
import { FashionType } from '../../enum/FashionType';
import { BookType } from '../../enum/BookType';
import { PropertyType } from '../../enum/PropertyType';
import { JobType } from '../../enum/JobType';
import { CommercialServiceType } from '../../enum/CommercialServiceType';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  expandIconVisible: boolean = true;
  vehicleTypes = VehicleType;
  gadgetsTypes = GadgetType;
  ElectronicAppliancesTypes = ElectronicApplianceType;
  furnitureTypes = FurnitureType;
  sportTypes = SportType;
  petTypes = PetType;
  fashionTypes  = FashionType;
  bookTypes = BookType;
  propertyTypes = PropertyType;
  jobTypes = JobType;
  commercialServicTypes = CommercialServiceType;
  isUserLogedIn: boolean = false;
  userData: any;
  imageUrl: string = "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg";
  dialogRef: MatDialogRef<any> | null = null;
  constructor(private dialog: MatDialog, private router: Router, private userService: UserService) {

   }

   generateGadgetsLink(subCategory?: GadgetType) {
    if (subCategory) {
      return '/Gadgets/view-posts?type=Gadget&sub=' + subCategory;
    } else {
      return '/Gadgets/view-posts?type=Gadget';
    }
  }

  generateQueryParams() {
    const queryParams = {
      type: 'Gadget',
      sub: [this.gadgetsTypes.Mobiles, this.gadgetsTypes.Tablets, this.gadgetsTypes.Accessories]
    };
    console.log([this.gadgetsTypes.Mobiles, this.gadgetsTypes.Tablets, this.gadgetsTypes.Accessories])

    return queryParams;
  }

  searchQuery: string = '';

  locationSearchQuery: string = '';

  clearSearchText(): void {
    this.searchQuery = '';
  }

  clearLocationSearchText(): void {
    this.locationSearchQuery = ''; 
  }

  ngOnInit() {
    console.log(VehicleType.Car);
    if (localStorage.getItem("authToken") != null) {
      this.isUserLogedIn = true;
      this.getUserData();
    }
    this.userService.getData().subscribe(data => {
      this.getUserData();
    })
  }
  openLoginModal() {

    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(LoginComponent, { width: '500px' });

    this.dialogRef.afterClosed().subscribe(result => {
      if (localStorage.getItem("authToken") != null)
        this.isUserLogedIn = true;
    });
  }
  openSignUpModal() {

    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(SignupComponent, { width: '500px' });

    this.dialogRef.afterClosed().subscribe(result => {
      this.isUserLogedIn = false;
    });
  }
  logout() {
    if (localStorage.getItem("authToken") != null) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("userId");
      this.isUserLogedIn = false;
      this.router.navigate(['/']);
    }
  }
  getUserData() {
    if (localStorage.getItem("id") != null) {
      this.userService.getUserById(Number(localStorage.getItem("id"))).subscribe((userData: any) => {
        this.userData = userData[0];
        if (this.userData.userImageList.length > 0) {
          this.imageUrl = this.userData.userImageList[this.userData.userImageList.length - 1].imageURL;
        }
      });
    }
  }
  toggleExpandIcons(): void {
    this.expandIconVisible = !this.expandIconVisible;
  }
  postAdd() {
    if (localStorage.getItem('id') != null)
      this.router.navigate(['/post-menu']);
    else
      this.openLoginModal();
  }
}
