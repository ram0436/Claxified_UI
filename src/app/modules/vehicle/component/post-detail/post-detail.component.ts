import { Component } from '@angular/core';
import * as moment from 'moment';
import { VehicleService } from '../../service/vehicle.service';
import { FuelType } from 'src/app/shared/enum/FuelType';
import { TransmissionType } from 'src/app/shared/enum/TransmissionType';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from '../../../user/component/login/login.component';
import { SignupComponent } from '../../../user/component/signup/signup.component'

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css', '../../../module.component.css']
})
export class PostDetailComponent {

  postDetails: any;
  isPhoneNumberHidden = true;
  isUserLogedIn: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;
  post: any;
  imagesList: any = [];
  isLoading: boolean = true;
  currentDate: Date = new Date();
  imageIndex: number = 0;
  fuelTypes = Object.keys(FuelType).map((key: any) => ({
    label: key,
    id: FuelType[key],
  }));
  transmissionTypes = Object.keys(TransmissionType).map((key: any) => ({
    label: key,
    id: TransmissionType[key],
  }));
  fuelType: any;
  transmissionType: any;
  relatedPosts: any = [
    { title: "Iphonr 10", price: 25000, state: "Telangana", city: "Hyderabad", nearBy: "Erragadda", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 11", price: 35000, state: "Telangana", city: "Hyderabad", nearBy: "Moosapet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 12", price: 45000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 13", price: 55000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
  ];

  targetRoute: any;

  isZoomed: boolean = false;

  reporterClicked = false;

  iconName = 'arrow_drop_down';

  showReportOptions: boolean = false;
  currentSlideIndex = 0;
  carouselItems = [
    "Be wary of buyers asking to use 'Claxified delivery' or 'Payments on Claxified' for anything other than private cars",
    "Share photos and ask lots of questions about the items you are buying and selling",
    "If an ad or reply sounds too good to be true, it probably is",
    "Use the 'Reply to ad' button for your safety and privacy"
  ];

  constructor(private vehicleService: VehicleService, private route: ActivatedRoute, private location: Location, private router: Router,  private dialog: MatDialog) { 
  }


  ngOnInit() {
    this.fuelTypes = this.fuelTypes.slice(this.fuelTypes.length / 2);
    this.transmissionTypes = this.transmissionTypes.slice(this.transmissionTypes.length / 2);
    var tableRefGuid;
    this.route.paramMap.subscribe((params) => {
      tableRefGuid = params.get('id');
      this.targetRoute = params.get('targetRoute');
    });
    if (tableRefGuid != null) {
      this.getVehiclePost(tableRefGuid);
    }
  }

  formatPrice(price: number): string {
    const roundedPrice = Math.round(price);
  
    const formattedPrice = roundedPrice.toLocaleString('en-IN');
  
    return formattedPrice;
  }

  prevItem() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
    this.updateButtonState();
  }

  nextItem() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.carouselItems.length;
    this.updateButtonState();
  }

  updateButtonState() {
    const isFirstItem = this.currentSlideIndex === 0;
    const isLastItem = this.currentSlideIndex === this.carouselItems.length - 1;

    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    if (prevButton) {
      prevButton.classList.toggle('disabled', isFirstItem);
    }

    if (nextButton) {
      nextButton.classList.toggle('disabled', isLastItem);
    }
  }

  toggleReportOptions() {
    this.showReportOptions = !this.showReportOptions;
    this.reporterClicked = !this.reporterClicked;
    this.iconName = this.showReportOptions ? 'arrow_drop_up' : 'arrow_drop_down';
  }

  zoomIn() {
    this.isZoomed = !this.isZoomed;

    // Toggle a class to style the expanded image
    const imgElement = document.querySelector('.postImgCont');
    if (imgElement) {
      imgElement.classList.toggle('zoomed');
    }
  }

  closeZoom() {
    this.isZoomed = false;
    const imgElement = document.querySelector('.postImgCont');
    if (imgElement) {
      imgElement.classList.remove('zoomed');
    }
  }

  goBack() {
    this.router.navigate(['/Vehicles/view-posts'], {
      queryParams: {
        type: 'Vehicle',
        sub: 5
      }
    });
  }

  getVehiclePost(guid: any) {
    this.vehicleService.getVehiclePostById(guid).subscribe((data: any) => {
      this.postDetails = data[0];
      this.imagesList = this.postDetails.vehicleImageList;
      this.fuelType = this.fuelTypes.filter(fuel => fuel.id == this.postDetails.fuelType);
      this.transmissionType = this.transmissionTypes.filter(transmission => transmission.id == this.postDetails.transmissionType);
      this.isLoading = false;
    });
  }
  formatDate(date: any): any {
    const inputDate: Date = new Date(date);
    const daysAgo = moment(this.currentDate).diff(inputDate, 'days');

    if (daysAgo >= 0 && daysAgo <= 7) {
      if (daysAgo === 0) {
        return 'Today';
      } else if (daysAgo === 1) {
        return 'Yesterday';
      } else {
        return daysAgo + ' days ago';
      }
    } else {
      return moment(inputDate).format('MMM DD');
    }
  }
  showPrevious() {
    this.imageIndex = this.imageIndex - 1;
  }
  showNext() {
    this.imageIndex = this.imageIndex + 1;
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

  revealPhoneNumber() {
    if (localStorage.getItem('id') != null)
      this.isPhoneNumberHidden = !this.isPhoneNumberHidden;
    else
      this.openLoginModal();
  }
}
