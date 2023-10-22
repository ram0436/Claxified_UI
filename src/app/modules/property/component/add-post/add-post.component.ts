import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/modules/user/service/user.service';
import { ConstructionStatus } from 'src/app/shared/enum/ConstructionStatus';
import { FacingType } from 'src/app/shared/enum/FacingType';
import { FurnishingStatus } from 'src/app/shared/enum/FurnishingStatus';
import { HouseType } from 'src/app/shared/enum/HouseType';
import { ListedBy } from 'src/app/shared/enum/ListBy';
import { Common } from 'src/app/shared/model/CommonPayload';
import { CommonService } from 'src/app/shared/service/common.service';
import { PropertyService } from '../../service/property.service';
import { ServiceType } from 'src/app/shared/enum/ServiceType';
import { PGType } from 'src/app/shared/enum/PGType';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css', '../../../moduleaddpost.component.css']
})
export class AddPostComponent {

  brandControl = new FormControl("");
  modelControl = new FormControl("");
  filteredBrands!: Observable<{ id: number; brandName: string; }[]>;
  filteredModels!: Observable<{ id: number; model: string; }[]>;
  cardsCount: any[] = new Array(10);
  currentImageIndex: any = 0;
  numericValue: number = 0;
  brands: any = [];
  selectedImage: string = "";
  commonPayload: Common = new Common();
  subCategory: string = '';
  mainCategory: string = '';
  selectedFuelType: string = "";
  currentUploadImageIndex: number = 0;
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
  selectedFuel: string = "";
  selectedTransmission: any;
  selectedOwnerNumber: Number = 0;
  allUploadedFiles: any = [];
  brandId: any;
  progress: boolean = false;
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
  userData: any;
  imageUrl: string = '../../../../../assets/img_not_available.png';
  carModels: any;
  carModelId: any;

  firstImageUploaded: boolean = false; // Changes made by Hamza
  houseApartmentsSale = ['HouseType', 'Bedrooms', 'Bathrooms', 'Furnishing', 'Construction Status', 'Listed by', 'Super Builtup area', 'Carpet Area', 'Maintenance', 'Total Floors', 'Floor No', 'Car Parking', 'Facing', 'Project Name'];
  houseApartmentsRent = ['HouseType', 'Bedrooms', 'Bathrooms', 'Furnishing', 'Construction Status', 'Listed by', 'Super Builtup area', 'Carpet Area', 'Bachelors Allowed', 'Maintenance', 'Total Floors', 'Floor No', 'Car Parking', 'Facing', 'Project Name'];
  landsAndPlots = ['ServiceType', 'Listed by', 'Plot Area', 'Length', 'Breadth', 'Facing', 'Project Name'];
  shopsAndOfcRent = ['Furnishing', 'Listed by', 'Super Builtup area', 'Carpet Area', 'Maintenance', 'Car Parking', 'Bathrooms', 'Project Name'];
  shopsAndOfcSale = ['Furnishing', 'Construction Status', 'Listed by', 'Super Builtup area', 'Carpet Area', 'Maintenance', 'Car Parking', 'Bathrooms', 'Project Name'];
  pgAndGuestHouses = ['SubType', 'Furnishing', 'Listed by', 'Car Parking', 'Meals Included'];
  fieldsToShow: any = [];

  constructor(private propertyService: PropertyService, private commonService: CommonService, private snackBar: MatSnackBar, private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document, private userService: UserService,private router : Router) { }

  ngOnInit() {
    this.getUserData();
    this.houseTypes = this.houseTypes.slice(this.houseTypes.length / 2);
    this.furnishingStatus = this.furnishingStatus.slice(this.furnishingStatus.length / 2);
    this.constructionStatus = this.constructionStatus.slice(this.constructionStatus.length / 2);
    this.facingTypes = this.facingTypes.slice(this.facingTypes.length / 2);
    this.listedBy = this.listedBy.slice(this.listedBy.length / 2);
    this.serviceTypes = this.serviceTypes.slice(this.serviceTypes.length / 2);
    this.pgTypes = this.pgTypes.slice(this.pgTypes.length / 2);
    for (var i = 0; i < this.cardsCount.length; i++) {
      this.cardsCount[i] = "";
    }
    this.route.queryParams.subscribe(params => {
      this.subCategory = params['sub'].replaceAll("%20", "");
      switch (this.subCategory) {
        case 'For Sale: Houses & Apartments': {
          this.fieldsToShow = this.houseApartmentsSale;
          break;
        }
        case 'For Rent: Houses & Apartments': {
          this.fieldsToShow = this.houseApartmentsRent;
          break;
        }
        case 'Lands & Plot': {
          this.fieldsToShow = this.landsAndPlots;
          break;
        }
        case 'For Rent: Shop & Offices': {
          this.fieldsToShow = this.shopsAndOfcRent;
          break;
        }
        case 'For Sale: Shops & Offices': {
          this.fieldsToShow = this.shopsAndOfcSale;
          break;
        }
        case 'PG & Guest Houses': {
          this.fieldsToShow = this.pgAndGuestHouses;
          break;
        }
      }
      this.mainCategory = params['main'];
      this.setCategoryId();
      let mode = params['mode'];
      if(mode !=undefined){
        let guid = localStorage.getItem('guid');
        this.propertyService.getPropertyPostById(guid).subscribe((res:any)=>{
          this.commonPayload = res[0];
          Object.keys(this.propertyData).forEach(key=>{
            this.propertyData[key] = res[0][key];
          });
          res[0].propertyImageList.forEach((image:any,index:any)=>{
            this.cardsCount[index] = image.imageURL;
          });
        })
      }
    });
  }
  allowOnlyNumbers(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    const numericInput = inputValue.replace(/[^0-9.-]/g, '');
    inputElement.value = numericInput;
    this.numericValue = parseFloat(numericInput);
  }
  selectFile() {
    if (this.document) {
      const uploadElement = this.document.getElementById("fileUpload");
      if (uploadElement) {
        uploadElement.click();
      }
    }
  }
  selectImage(event: any): void {
    var files = event.target.files;
    const formData = new FormData();
    this.progress = true;
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    this.propertyService.uploadPropertyImages(formData).subscribe((data: any) => {
      this.progress = false;
      let imagesLength = data.length;
      let dataIndex = 0;

      for (let j = 0; j < this.cardsCount.length && dataIndex < data.length; j++) {
        if (this.cardsCount[j] === "") {
          this.cardsCount[j] = data[dataIndex];
          dataIndex++;
          imagesLength--;
        }

        // Set firstImageUploaded to true if this is the first image
        if (!this.firstImageUploaded) {
          this.firstImageUploaded = true;
        }

      };
    })
  }
  deleteBackgroundImage(index: any): void {
    for (let i = index; i < this.cardsCount.length - 1; i++) {
      this.cardsCount[i] = this.cardsCount[i + 1];
    }
    this.cardsCount[this.cardsCount.length - 1] = '';
  }
  postAdd() {
    this.commonPayload.isPremium = true;
    this.commonPayload.isActive = true;
    this.commonPayload.createdBy = this.userData.id;
    this.commonPayload.createdOn = new Date().toISOString().slice(0, 23);
    this.commonPayload.modifiedBy = this.userData.id;
    this.commonPayload.modifiedOn = new Date().toISOString().slice(0, 23);
    this.commonPayload.price = Number(this.commonPayload.price);
    this.commonPayload.name = this.userData.firstName;
    this.commonPayload.mobile = this.userData.mobileNo;
    var payload = this.addSpecificPayload(this.commonPayload);
    if(payload.id)
      this.updatePropertyPost(payload);
    else
      this.savePropertyPost(payload);
  }
  getAddress(event: any) {
    let pincode = event.target.value;
    if (pincode.length == 6) {
      this.commonService.getAddress(pincode).subscribe((data: any) => {
        if (data[0].PostOffice != null) {
          var address = data[0].PostOffice[0];
          this.commonPayload.state = address.State;
          this.commonPayload.city = address.District;
          this.commonPayload.nearBy = address.Name;
        }
      })
    }
  }
  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
  selectHouseType(house: any) {
    this.propertyData.houseType = house.id;
  }
  selectFurnishing(furnishing: any) {
    this.propertyData.furnishingStatus = furnishing.id;
  }
  selectBedRoomNumber(bedRoomNumber: Number) {
    this.propertyData.bedrooms = bedRoomNumber;
  }
  selectBathRoomNumber(bathRoomNumber: Number) {
    this.propertyData.bathrooms = bathRoomNumber;
  }
  selectConstructionStatus(constructionStatus: any) {
    this.propertyData.constructionStatus = constructionStatus.id;
  }
  selectListBy(listBy: any) {
    this.propertyData.listedBy = listBy.id;
  }
  selectCarParking(carParking: any) {
    this.propertyData.carParking = carParking;
  }
  handleFacingType(facingType: any) {
    this.propertyData.facingType = facingType.value;
  }
  selectBachelor(bachelorAllowed: any) {
    this.propertyData.bachelorAllowed = bachelorAllowed.value;
  }
  selectServiceType(serviceType:any){
    this.propertyData.serviceType = serviceType.id;
  }
  selectPgType(pgType:any){
    this.propertyData.pgType = pgType.id;
  }
  selectMeal(mealIncluded:any){
    this.propertyData.isMealIncluded = mealIncluded.value;
  }
  setSubCategory() {
    this.commonService.getSubCategoryByCategoryId(this.commonPayload.categoryId).subscribe((data: any) => {
      for (let subCategory of data) {
        if (subCategory.subCategoryName == this.subCategory) {
          this.commonPayload.subCategoryId = subCategory.id;
          break;
        }
      }
    });
  }
  setCategoryId() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      for (let mainCategory of data) {
        if (mainCategory.categoryName == this.mainCategory) {
          this.commonPayload.categoryId = mainCategory.id;
          this.setSubCategory()
          break;
        }
      }
    });
  }
  addSpecificPayload(commonPayload: any): any {
    commonPayload.superBuildUpArea = Number(commonPayload.superBuildUpArea);
    commonPayload.carpetArea = Number(commonPayload.carpetArea);
    commonPayload.maintenanceCharge = Number(commonPayload.maintenanceCharge);
    commonPayload.superBuildUpArea = Number(commonPayload.superBuildUpArea);
    var imageList: { propertyId: number; imageId: string; imageURL: any; }[] = [];
    this.cardsCount.forEach(imageURL => {
      if (imageURL != "")
        imageList.push({ "propertyId": 0, "imageId": "100", "imageURL": imageURL });
    });
    var payload = Object.assign({}, commonPayload, this.propertyData, {
      propertyImageList: imageList,
    });
    return payload;
  }
  savePropertyPost(payload: any) {
    if (this.validatePostForm(payload))
      this.propertyService.savePropertyPost(payload).subscribe(data => {
        this.showNotification("Post added succesfully");
        this.router.navigateByUrl('/post-menu');
      });
  }
  getUserData() {
    let userId = localStorage.getItem('id');
    if (userId != null) {
      this.userService.getUserById(Number(userId)).subscribe((res: any) => {
        this.userData = res[0];
        if (this.userData.userImageList.length > 0)
          this.imageUrl = this.userData.userImageList[this.userData.userImageList.length - 1].imageURL;
      })
    }
  }
  uploadProfilePicture(event: any) {
    var files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    this.userService.uploadProfilePicture(formData).subscribe((data: any) => {
      if (data.length > 0) {
        this.imageUrl = data[0];
        this.userService.getUserById(Number(localStorage.getItem("id"))).subscribe((userData: any) => {
          if (userData.length > 0) {
            userData[0].userImageList.push({ "id": 0, "imageId": "st", "imageURL": data[0], "usersId": Number(localStorage.getItem("id")) });
            this.userService.updateUser(userData[0]).subscribe(res => {
            })
          }
        })
      }
    })
  }
  validatePostForm(payload: any): boolean {
    let flag = false;
    if (payload.title == "")
      this.showNotification("Title is required");
    else if (payload.title.length < 15 || payload.title.length > 50)
      this.showNotification("Title should be min 15 and max of 50 charecters");
    else if (payload.discription == "")
      this.showNotification("discription is required");
    else if (payload.discription.length < 15 || payload.discription.length > 500)
      this.showNotification("discription should be min 15 and max 500 charecters");
    else if (payload.price == 0)
      this.showNotification("price is rerquired");
    else if (payload.price < 10 || payload.price > 1000000)
      this.showNotification("price should be min 10 and max 1000000");
    else if (payload.propertyImageList.length <= 0)
      this.showNotification("In upload photo, at least 1 photo is required.");
    else if (payload.pincode.length < 6)
      this.showNotification("Pincode should be 6 digits");
    else
      flag = true;
    return flag;
  }
  selectProfilePicture() {
    if (this.document) {
      const uploadElement = this.document.getElementById("upload");
      if (uploadElement) {
        uploadElement.click();
      }
    }
  }
  allowOnlyNumbersInInput(event: Event, input: string): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    const numericInput = inputValue.replace(/[^0-9.-]/g, '');
    inputElement.value = numericInput;
    this.propertyData[input] = Number(numericInput);
  }
  updatePropertyPost(payload: any) {
    if (this.validatePostForm(payload))
      this.propertyService.updatePropertyPost(payload).subscribe(data => {
        this.showNotification("Post updated succesfully");
        this.router.navigateByUrl('/post-menu');
      });
  }
}
