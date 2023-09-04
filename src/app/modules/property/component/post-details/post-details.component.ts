import { Component } from '@angular/core';
import { PropertyService } from '../../service/property.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ConstructionStatus } from 'src/app/shared/enum/ConstructionStatus';
import { FacingType } from 'src/app/shared/enum/FacingType';
import { FurnishingStatus } from 'src/app/shared/enum/FurnishingStatus';
import { HouseType } from 'src/app/shared/enum/HouseType';
import { ListedBy } from 'src/app/shared/enum/ListBy';
import { PGType } from 'src/app/shared/enum/PGType';
import { ServiceType } from 'src/app/shared/enum/ServiceType';
import { PropertyType } from 'src/app/shared/enum/PropertyType';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css',  '../../../module.component.css']
})
export class PostDetailsComponent {

  postDetails: any;
  post: any;
  imagesList: any = [];
  isLoading: boolean = true;
  currentDate: Date = new Date();
  imageIndex: number = 0;
  relatedPosts: any = [
    { title: "Iphonr 10", price: 15000, state: "Telangana", city: "Hyderabad", nearBy: "Erragadda", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 11", price: 25000, state: "Telangana", city: "Hyderabad", nearBy: "Moosapet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 12", price: 35000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 13", price: 45000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 14", price: 55000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 15", price: 65000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
  ];
  itemsPerPage = 4;
  currentPage = 0;
  houseTypes = Object.keys(HouseType).map((key: any) => ({
    label: key,
    id: HouseType[key],
  }));
  furnishingStatus = Object.keys(FurnishingStatus).map((key: any) => ({
    label: key,
    id: FurnishingStatus[key],
  }));
  constructionStatus = Object.keys(ConstructionStatus).map((key: any) => ({
    label: key,
    id: ConstructionStatus[key],
  }));
  listedBy = Object.keys(ListedBy).map((key: any) => ({
    label: key,
    id: ListedBy[key],
  }));
  facingTypes = Object.keys(FacingType).map((key: any) => ({
    label: key,
    id: FacingType[key],
  }));
  serviceTypes = Object.keys(ServiceType).map((key: any) => ({
    label: key,
    id: ServiceType[key],
  }));
  pgTypes = Object.keys(PGType).map((key: any) => ({
    label: key,
    id: PGType[key],
  }));
  bachelorsAllowed = [{ label: 'No', value: false }, { label: 'Yes', value: true }];
  mealsIncluded = [{ label: 'No', value: false }, { label: 'Yes', value: true }];
  numberOfBedRooms = [1, 2, 3, 4];
  numberOfBathRooms = [1, 2, 3, 4];
  carParking = [1, 2, 3, 4];
  houeseType: { label: any; id: string; }[] = [];
  furnishing: { label: any; id: string; }[] = [];
  listed_By: { label: any; id: string; }[] = [];
  facingType: { label: any; id: string; }[] = [];
  serviceType: { label: any; id: string; }[] = [];
  pgType: { label: any; id: string; }[] = [];
  construction_status: { label: any; id: string; }[] = [];
  propertyData: any = {
    houseType: 0,
    serviceType: 0,
    bedrooms: 0,
    bathrooms: 0,
    furnishingStatus: 0,
    constructionStatus: 0,
    listedBy: 0,
    superBuildUpArea: 0,
    carpetArea: 0,
    bachelorAllowed: true,
    maintenanceCharge: 0,
    totalFloors: 0,
    floorNumber: 0,
    carParking: 0,
    facingType: 0,
    projectName: "",
    plotArea: 0,
    lenght: 0, // spll misatake
    breadth: 0,
    isMealIncluded: true,
    pgType: 0
  }
  houseApartmentsSale = ['houseType', 'bedrooms', 'bathrooms', 'furnishingStatus', 'constructionStatus', 'listedBy', 'superBuildUpArea', 'carpetArea', 'maintenanceCharge', 'totalFloors', 'floorNumber', 'carParking', 'facingType', 'projectName'];
  houseApartmentsRent = ['houseType', 'bedrooms', 'bathrooms', 'furnishingStatus', 'constructionStatus', 'listedBy', 'superBuildUpArea', 'carpetArea', 'bachelorAllowed', 'maintenanceCharge', 'totalFloors', 'floorNumber', 'carParking', 'facingType', 'projectName'];
  landsAndPlots = ['serviceType', 'listedBy', 'plotArea', 'lenght', 'breadth', 'facingType', 'projectName'];
  shopsAndOfcRent = ['furnishingStatus', 'listedBy', 'superBuildUpArea', 'carpetArea', 'maintenanceCharge', 'carParking', 'bathrooms', 'projectName'];
  shopsAndOfcSale = ['furnishingStatus', 'constructionStatus', 'listedBy', 'superBuiltupArea', 'carpetArea', 'maintenanceCharge', 'carParking', 'bathrooms', 'projectName'];
  pgAndGuestHouses = ['subType', 'furnishingStatus', 'listedBy', 'carParking', 'mealsIncluded'];
  isZoomed: boolean = false;

  constructor(private propertyService: PropertyService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    var tableRefGuid;
    this.route.paramMap.subscribe((params) => {
      tableRefGuid = params.get('id');
    });
    if (tableRefGuid != null) {
      this.getPropertyPost(tableRefGuid);
    }
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
    this.router.navigate(['/Properties/view-posts'], {
      queryParams: {
        type: 'Property',
        sub: 11
      }
    });
  }
  getPropertyPost(guid: any) {
    this.propertyService.getPropertyPostById(guid).subscribe((data: any) => {
      this.postDetails = data[0];
      this.isLoading = false;
      this.imagesList = this.postDetails.propertyImageList;
      this.houeseType = this.houseTypes.filter(houseType => houseType.id == this.postDetails.houseType);
      if (this.houeseType.length > 0)
        this.postDetails.houseType = this.houeseType[0].label;
      this.furnishing = this.furnishingStatus.filter(furnishing => furnishing.id == this.postDetails.furnishingStatus);
      if (this.furnishing.length > 0)
        this.postDetails.furnishingStatus = this.furnishing[0].label;
      this.listed_By = this.listedBy.filter(listedBy => listedBy.id == this.postDetails.listedBy);
      if (this.listed_By.length > 0)
        this.postDetails.listedBy = this.listed_By[0].label;
      this.facingType = this.facingTypes.filter(facingType => facingType.id == this.postDetails.facingType);
      if (this.facingType.length > 0)
        this.postDetails.facingType = this.facingType[0].label;
      this.serviceType = this.serviceTypes.filter(serviceType => serviceType.id == this.postDetails.serviceType);
      if (this.serviceType.length > 0)
        this.postDetails.serviceType = this.serviceType[0].label;
      this.pgType = this.pgTypes.filter(pgType => pgType.id == this.postDetails.pgType);
      if (this.pgType.length > 0)
        this.postDetails.pgType = this.pgType[0].label;
      this.construction_status = this.constructionStatus.filter(status => status.id == this.postDetails.constructionStatus);
      if (this.construction_status.length > 0)
        this.postDetails.constructionStatus = this.construction_status[0].label;
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
  handleNext(): void {
    if (this.currentPage < Math.ceil(this.relatedPosts.length / this.itemsPerPage) - 1) {
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
  getProperties(dataItem: any) {
    var properties: any = [];
    var propertiesToShow: any = [];
    switch (dataItem.subCategoryId) {
      case PropertyType.ForRentHousesApartments: {
        propertiesToShow = this.houseApartmentsRent;
        break;
      }
      case PropertyType.ForSaleHousesApartments: {
        propertiesToShow = this.houseApartmentsSale;
        break;
      }
      case PropertyType.LandsAndPlot: {
        propertiesToShow = this.landsAndPlots;
        break;
      }
      case PropertyType.ForRentShopOffices: {
        propertiesToShow = this.shopsAndOfcRent;
        break;
      }
      case PropertyType.ForSaleShopsOffices: {
        propertiesToShow = this.shopsAndOfcSale;
        break;
      }
      case PropertyType.PGAndGuestHouses: {
        propertiesToShow = this.pgAndGuestHouses;
        break;
      }
    }
    Object.keys(dataItem).forEach(key => {
      if (propertiesToShow.includes(key)) {
        properties.push({ label: key, value: dataItem[key] });
      }
    });
    return properties;
  }
}
