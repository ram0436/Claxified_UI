import { DOCUMENT } from '@angular/common';
import { Component, Inject, EventEmitter, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { UserService } from 'src/app/modules/user/service/user.service';
import { FuelType } from 'src/app/shared/enum/FuelType';
import { TransmissionType } from 'src/app/shared/enum/TransmissionType';
import { Common } from 'src/app/shared/model/CommonPayload';
import { CommonService } from 'src/app/shared/service/common.service';
import { VehicleService } from '../../service/vehicle.service';
import { AdminDashboardService } from './../../../admin/service/admin-dashboard.service';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatSelectionList } from '@angular/material/list';
import { Filter } from 'src/app/shared/model/Filter';



@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css', '../../../moduleaddpost.component.css'],
})
export class AddPostComponent {

  brandControl = new FormControl({});
  modelControl = new FormControl({});
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
  fuelTypes = Object.keys(FuelType).map((key: any) => ({
    label: key,
    id: FuelType[key],
  }));
  transmissionTypes = Object.keys(TransmissionType).map((key: any) => ({
    label: key,
    id: TransmissionType[key],
  }));
  numberOfOwners = [1, 2, 3, 4];
  selectedFuel: string = "";
  selectedTransmission: any;
  selectedOwnerNumber: Number = 0;
  allUploadedFiles: any = [];
  brandId: any;
  progress: boolean = false;
  vehicleData: any = {
    fuelType: null,
    transmissionType: null,
    noOfOwner: null,
    kmDriven: null,
    year: null
  }
  imageUrl: string = '../../../../../assets/img_not_available.png';
  carModels: any;
  carModelId: any;

  firstImageUploaded: boolean = false; // Changes made by Hamza
  isDraggingEnabled = true;
  isFromAdmin: boolean = false;
  mode : any;

  postOffices: any[] = [];

  isPriceValid: boolean = true;

  locationConfirmationType: 'pincode' | 'manual' = 'pincode';

  stateControl = new FormControl("");
  cityControl = new FormControl("");
  nearByControl = new FormControl("");
  filteredStates!: Observable<{ id: number; name: string; }[]>;
  filteredCities!: Observable<{ id: number; name: string; }[]>;
  filteredNearBy!: Observable<{ id: number; name: string; }[]>;

  country: any;
  districts: any = [];
  cities: any = [];
  nearByPlaces: any = [];
  filtersSelected: boolean = false; 
  appliedFilters: any = [];

  filterObj = new Filter();

  @ViewChild('stateMatAutocomplete') stateAutocomplete!: MatAutocomplete;
  @ViewChild('cityMatAutocomplete') cityAutocomplete!: MatAutocomplete;
  @ViewChild('nearByMatAutocomplete') nearByAutocomplete!: MatAutocomplete;
  @ViewChild(MatSelectionList)
  matSelectionList!: MatSelectionList;

  userData: any = {
    id: null,
    authToken: null,
    userId: null,
    firstName: null,
    lastName: null,
    role: null,
    mobileNumber: null,
    isActiveUser: false,
    watsAppNumber: null,
    email: null,
    isBlockedUser: false,
  };

  selectedState: any;
  selectedCity: any;
  selectedNearBy: any;
  isAppSupport : boolean = false;

  isInputDisabledState: boolean = false;
  isInputDisabledCity: boolean = false;
  isInputDisabledNearBy: boolean = false;

  constructor(private vehicleService: VehicleService, private commonService: CommonService, private snackBar: MatSnackBar, private route: ActivatedRoute, private AdminDashboardService: AdminDashboardService,
    @Inject(DOCUMENT) private document: Document, private userService: UserService,private router : Router,private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    var role = localStorage.getItem("role");
    if(role != null && role == 'AppSupport')
      this.isAppSupport = true;
    else
      this.isAppSupport = false;
    this.commonService.getCountry().subscribe((data: any) => {
      this.country = data[0];
      this.getAllStates();
    });
    this.route.queryParams.subscribe(params => {
      this.isFromAdmin = params['fromAdmin'] === 'true';
    });
    this.getUserData();
    this.fuelTypes = this.fuelTypes.slice(this.fuelTypes.length / 2);
    this.transmissionTypes = this.transmissionTypes.slice(this.transmissionTypes.length / 2);
    for (var i = 0; i < this.cardsCount.length; i++) {
      this.cardsCount[i] = "";
    }
    this.route.queryParams.subscribe(params => {
      this.subCategory = params['sub'];
      this.mainCategory = params['main'];
      this.setCategoryId();
      switch (this.subCategory) {
        case "Cars": {
          this.getCarBrands();
          break;
        }
        case "Bikes": {
          this.getBikeBrands();
          break;
        }
        case "Scooty": {
          this.getScootyBrands();
          break;
        }
        case "Bicycle": {
          this.getBicycleBrands();
          break;
        }
      }
      this.mode = params['mode'];
      if(this.mode !=undefined){
        let guid = localStorage.getItem('guid');
        this.vehicleService.getVehiclePostById(guid).subscribe((res:any)=>{
          this.commonPayload = res[0];
          Object.keys(this.vehicleData).forEach(key=>{
            this.vehicleData[key] = res[0][key];
          });
          this.brandId = res[0].vehicelBrandId;
          res[0].vehicleImageList.forEach((image:any,index:any)=>{
            this.cardsCount[index] = image.imageURL;
          });
          if(this.brands.length > 0){
            let actualBrand = this.brands.find((brand:any)=>brand.id == res[0].vehicelBrandId);
            this.brandControl.patchValue(actualBrand);
          }
          this.vehicleService.getCarModels(this.brandId).subscribe((resp:any) => {
            this.carModels = resp;
            this.getFilteredModels();
            let actualModel =  resp.find((model:any)=>model.id == res[0].modelId);
            this.modelControl.patchValue(actualModel);
          });
          this.cdr.detectChanges();
        })
      }
    });
  }

  clearSearchText(formControl: FormControl, fieldName: string): void {
    formControl.setValue('');

    if (fieldName === 'state') {
      this.isInputDisabledState = false;
    } else if (fieldName === 'city') {
      this.isInputDisabledCity = false;
    } else if (fieldName === 'nearBy') {
      this.isInputDisabledNearBy = false;
    }
  }

  getAllStates() {
    this.commonService.getStatesByCountry(this.country.id).subscribe(data => {
      this.districts = data;
      this.getFilteredStates();
    });
  }

  getFilteredStates() {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.districts))
    );
  }
  filterLocations(value: any, dataArray: any[]): { id: number; name: string }[] {
    var filterValue = "";
    if (typeof value == 'object')
      filterValue = value.name.toLowerCase();
    else
      filterValue = value.toLowerCase();
    return dataArray.filter(
      (data: any) => data.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  onDistrictChange(event: any) {
    this.selectedState = event.option.value;
    this.filterObj.state = (event.option.value == null) ? null : event.option.value.name;
    this.isInputDisabledState = true;
    this.cityControl.setValue('');
    this.isInputDisabledCity = false;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("state", this.filterObj.state);
    if (this.filterObj.state == null)
      this.appliedFilters = this.appliedFilters.filter((item: any) => (item.name != 'city' && item.name != 'nearBy'));
    else
      this.getCities(event.option.value.id);

    this.filtersSelected = true; //Changes made by Hamza
    this.filterObj.state = event.option.value ? event.option.value.name : null;
    this.filterObj.city = null; // Reset city when state changes
    this.filterObj.nearBy = null; // Reset nearby when state changes
  }

  onCityChange(event: any) {
    this.selectedCity = event.option.value;
    this.filterObj.city = (event.option.value == null) ? null : event.option.value.name;
    this.isInputDisabledCity = true;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("city", this.filterObj.city);
    if (this.filterObj.city == null)
      this.appliedFilters = this.appliedFilters.filter((item: any) => (item.name != 'nearBy'));
    else
      this.getNearByPlaces(event.option.value.id);
    this.filtersSelected = true; //Changes made by Hamza
  }
  onNearByChange(event: any) {
    this.selectedNearBy = event.option.value;
    this.filterObj.nearBy = (event.option.value == null) ? null : event.option.value.name;
    this.isInputDisabledNearBy = true;
    this.updateAppliedFilters("nearBy", this.filterObj.nearBy);
    this.commonService.setData(this.filterObj);
    this.filtersSelected = true; //Changes made by Hamza
  }

  updateAppliedFilters(filterName: string, value: any) {
    let matchFound = false;
    for (let i = 0; i < this.appliedFilters.length; i++) {
      if (this.appliedFilters[i].name == filterName && (filterName == 'state' || filterName == 'city' || filterName == 'nearBy' || filterName == 'price' || filterName == 'kms')) {
        matchFound = true;
        (value == null) ? this.appliedFilters.splice(i, 1) : this.appliedFilters[i].value = value;
        break;
      }
    }
    if (!matchFound)
      this.appliedFilters.push({ name: filterName, value: value })
  }

  displayLocation(brand: any): string {
    return brand?.name || "";
  }

  getCities(stateId: Number) {
    this.commonService.getCitiesByState(stateId).subscribe(data => {
      this.cities = data;
      this.getFilteredCities();
    });
  }

  getFilteredCities() {
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.cities))
    );
  }
  getFilteredNearBy() {
    this.filteredNearBy = this.nearByControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.nearByPlaces))
    );
  }
  getNearByPlaces(cityId: Number) {
    this.commonService.getNearPlacesByCity(cityId).subscribe(data => {
      this.nearByPlaces = data;
      this.getFilteredNearBy();
    })
  }


  drop(event: CdkDragDrop<string[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(this.cardsCount, event.previousIndex, event.currentIndex);
    } else {
    }
    this.isDraggingEnabled = true; 
    
  }
  

  filterBrands(value: any): { id: number; brandName: string }[] {
    var filterValue = "";
    if (typeof value == 'object')
      filterValue = value.brandName.toLowerCase();
    else
      filterValue = value.toLowerCase();
    return this.brands.filter(
      (brand: any) => brand.brandName.toLowerCase().indexOf(filterValue) === 0
    );
  }
  // allowOnlyNumbers(event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;
  //   const inputValue = inputElement.value;
  //   const numericInput = inputValue.replace(/[^0-9]/g, '');
  //   const formattedInput = numericInput.length < 2 ? '00' : numericInput;
  //   inputElement.value = formattedInput;
  //   this.numericValue = parseFloat(formattedInput);
  // }

allowOnlyNumbers(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const inputValue = inputElement.value;
  const numericInput = inputValue.replace(/[^0-9]/g, '');
  inputElement.value = numericInput;
  this.numericValue = parseFloat(numericInput);

  this.isPriceValid = numericInput.length >= 2;
}

  allowOnlyNumbersPincode(event: Event): void {
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
    this.vehicleService.uploadVehicleImages(formData).subscribe((data: any) => {
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
      this.updateVehiclePost(payload);
    else
      this.saveVehiclePost(payload);
  }

  verifyAdd(){
    // this.commonPayload.isPremium = true;
    // this.commonPayload.isActive = true;
    // this.commonPayload.createdBy = this.userData.id;
    // this.commonPayload.createdOn = new Date().toISOString().slice(0, 23);
    // this.commonPayload.modifiedBy = this.userData.id;
    // this.commonPayload.modifiedOn = new Date().toISOString().slice(0, 23);
    // this.commonPayload.price = Number(this.commonPayload.price);
    // this.commonPayload.name = this.userData.firstName;
    // this.commonPayload.mobile = this.userData.mobileNo;
    // var payload = this.addSpecificPayload(this.commonPayload);
    if (this.isFromAdmin) {
        this.route.queryParams.subscribe(params => {
          const categoryId = params['categoryId']; 
          const tableRefGuid = params['tableRefGuid']
  
          this.AdminDashboardService.verifyAd(categoryId, tableRefGuid).subscribe(
            (response: any) => {
              // console.log('API Response:', response);
              this.adVerifiedNotification('Ad verified successfully');
            },
            (error: any) => {
              // console.error('API Error:', error);
            }
          );
        });
      }
  }

  adVerifiedNotification(message: string): void{
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
    this.router.navigateByUrl('/Admin/admin-dashboard');
  }

  // getAddress(event: any) {
  //   let pincode = event.target.value;
  //   if (pincode.length == 6) {
  //     this.commonService.getAddress(pincode).subscribe((data: any) => {
  //       if (data[0].PostOffice != null) {
  //         var address = data[0].PostOffice[0];
  //         this.commonPayload.state = address.State;
  //         this.commonPayload.city = address.District;
  //         this.commonPayload.nearBy = address.Name;
  //       }
  //     })
  //   }
  // }

  getAddress(event: any) {
    let pincode = event.target.value;
    if (pincode.length === 6) {
      this.commonService.getAddress(pincode).subscribe((data: any) => {
        if (data[0].PostOffice != null) {
          var address = data[0].PostOffice[0];
          this.commonPayload.state = address.State;
          this.commonPayload.city = address.District;
          this.postOffices = data[0].PostOffice;
          // If there are multiple post offices, set the default value to the first one
          if (this.postOffices.length > 1) {
            this.commonPayload.nearBy = this.postOffices[0].Name;
          } else {
            this.commonPayload.nearBy = address.Name;
          }
        }
      });
    }
  }

  updateLocationFromAddress(data: any) {
    if (data[0].PostOffice != null) {
      var address = data[0].PostOffice[0];
      this.commonPayload.state = address.State;
      this.commonPayload.city = address.District;
      this.postOffices = data[0].PostOffice;
      // If there are multiple post offices, set the default value to the first one
      if (this.postOffices.length > 1) {
        this.commonPayload.nearBy = this.postOffices[0].Name;
      } else {
        this.commonPayload.nearBy = address.Name;
      }
    }
  }

  resetManualLocationInputs() {
    this.stateControl.setValue("");
    this.cityControl.setValue("");
    this.nearByControl.setValue("");
    this.selectedState = null;
    this.selectedCity = null;
    this.selectedNearBy = null;
  }
  

  onLocationConfirmationTypeChange() {
    if (this.locationConfirmationType === 'pincode') {
      this.resetManualLocationInputs();
    }
  }




  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
  selectFuelType(fuel: any) {
    this.selectedFuel = fuel.label;
    this.vehicleData.fuelType = fuel.id;
  }
  selectTransmission(transmission: any) {
    this.selectedTransmission = transmission.label;
    this.vehicleData.transmissionType = transmission.id;
  }
  selectOwnerNumber(ownerNumber: Number) {
    this.selectedOwnerNumber = ownerNumber;
    this.vehicleData.noOfOwner = ownerNumber;
  }
  getCarBrands() {
    this.vehicleService.getCarBrands().subscribe(data => {
      this.brands = data;
      this.getFilteredBrands();
    });
  }
  getBikeBrands() {
    this.vehicleService.getBikeBrands().subscribe(data => {
      this.brands = data;
      this.getFilteredBrands();
    });
  }
  getFilteredBrands() {
    this.filteredBrands = this.brandControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterBrands(value || ""))
    );
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
    Object.keys(this.vehicleData).forEach((key:any)=>{
      if(this.vehicleData[key] == null)
        this.vehicleData[key] = 0;
    });
    var imageList: { vehiclesId: number; imageId: string; imageURL: any; }[] = [];
    this.cardsCount.forEach(imageURL => {
      if (imageURL != "")
        imageList.push({ "vehiclesId": 0, "imageId": "100", "imageURL": imageURL });
    });
    var payload = Object.assign({}, commonPayload, this.vehicleData, {
      vehicleImageList: imageList,
      vehicelBrandId: this.brandId,
    });
    if(this.subCategory == 'Cars' || this.subCategory == 'Bikes')
      payload.modelId = this.carModelId;
    return payload;
  }
  handleBrand(data: any) {
    this.brandId = data.id;
    this.modelControl.patchValue({});
    if(this.subCategory == 'Cars')
      this.getCarModels(data.id);
    else
      this.getBikeModels(data.id);
  }
  displayBrand(brand: any): string {
    return brand.brandName || "";
  }
  getScootyBrands() {
    this.vehicleService.getScootyBrands().subscribe(data => {
      this.brands = data;
      this.getFilteredBrands();
    })
  }
  getBicycleBrands() {
    this.vehicleService.getBicycleBrands().subscribe(data => {
      this.brands = data;
      this.getFilteredBrands();
    })
  }
  saveVehiclePost(payload: any) {
    if (this.validatePostForm(payload))
      if (this.locationConfirmationType === 'manual') {
        payload.state = this.selectedState ? this.selectedState.name : null;
        payload.city = this.selectedCity ? this.selectedCity.name : null;
        payload.nearBy = this.selectedNearBy ? this.selectedNearBy.name : null;
      }
      this.vehicleService.saveVehiclePost(payload).subscribe(data => {
        this.showNotification("Post added succesfully");
        this.router.navigateByUrl('/post-menu');
      });
  }
  onYearChangeEvent(event: any) {
    this.vehicleData.year = event.target.value;
  }
  onKmsChangeEvent(event: any) {
    this.vehicleData.kmDriven = event.target.value;
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
    else if (payload.title.length < 5 || payload.title.length > 50)
      this.showNotification("Title should be min 5 and max of 50 charecters");
    else if (payload.discription == "")
      this.showNotification("discription is required");
    else if (payload.discription.length < 15 || payload.discription.length > 500)
      this.showNotification("discription should be min 15 and max 500 charecters");
    else if (payload.price == 0)
      this.showNotification("price is rerquired");
    else if (payload.price < 10)
      this.showNotification("price should be min 10");
    else if (payload.price.length < 2)
      this.showNotification("price should be contain a minimum of two digits");
    else if (payload.vehicleImageList.length <= 0)
      this.showNotification("In upload photo, at least 1 photo is required.");
    else if (this.locationConfirmationType === 'pincode' && payload.pincode.length < 6)
      this.showNotification("Pincode should be 6 digits");
    else if (this.locationConfirmationType === 'manual' && (!payload.state || !payload.city || !payload.nearBy)) {
        this.showNotification("State, City, and Near By are required for manual location entry");
    }
    else
      flag = true;
    return flag;
  }
  getCarModels(brandId: Number) {
    this.vehicleService.getCarModels(brandId).subscribe(res => {
      this.carModels = res;
      this.getFilteredModels();
    });
  }
  getFilteredModels() {
    this.filteredModels = this.modelControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterModels(value || ""))
    );
  }
  filterModels(value: any): { id: number; model: string }[] {
    var filterValue = "";
    if (typeof value == 'object')
      filterValue = value.model.toLowerCase();
    else
      filterValue = value.toLowerCase();
    return this.carModels.filter(
      (model: any) => model.model.toLowerCase().indexOf(filterValue) === 0
    );
  }
  displayModel(model: any): string {
    return model?.model || "";
  }
  handleModel(data: any) {
    this.carModelId = data.id;
  }
  selectProfilePicture() {
    if (this.document) {
      const uploadElement = this.document.getElementById("upload");
      if (uploadElement) {
        uploadElement.click();
      }
    }
  }
  updateVehiclePost(payload: any) {
    if (this.validatePostForm(payload))
      if (this.locationConfirmationType === 'manual') {
        payload.state = this.selectedState ? this.selectedState.name : null;
        payload.city = this.selectedCity ? this.selectedCity.name : null;
        payload.nearBy = this.selectedNearBy ? this.selectedNearBy.name : null;
      }
      this.vehicleService.updateVehiclePost(payload).subscribe(data => {
        this.showNotification("Post updated succesfully");
        this.router.navigateByUrl('/post-menu');
      });
  }
  getBikeModels(brandId: Number) {
    this.vehicleService.getBikeModels(brandId).subscribe(res => {
      this.carModels = res;
      this.getFilteredModels();
    });
  }
}
