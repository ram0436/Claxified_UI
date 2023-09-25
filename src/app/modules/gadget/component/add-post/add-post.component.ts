import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { UserService } from 'src/app/modules/user/service/user.service';
import { Common } from 'src/app/shared/model/CommonPayload';
import { CommonService } from 'src/app/shared/service/common.service';
import { GadgetService } from '../../service/gadget.service';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css', '../../../moduleaddpost.component.css']
})
export class AddPostComponent {

  myControl = new FormControl("");
  filteredBrands!: Observable<{ id: number; brandName: string; }[]>;
  cardsCount: any[] = new Array(10);
  currentImageIndex: any = 0;
  numericValue: number = 0;
  brands: any = [];
  selectedImage: string = "";
  commonPayload: Common = new Common();
  subCategory: string = '';
  mainCategory: string = '';
  currentUploadImageIndex: number = 0;
  allUploadedFiles: any = [];
  brandId: any;
  progress: boolean = false;
  userData: any;
  imageUrl: string = '../../../../../assets/img_not_available.png';
  firstImageUploaded: boolean = false; // Changes made by Hamza

  constructor(private gadgetService: GadgetService, private commonService: CommonService, private snackBar: MatSnackBar, private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document, private userService: UserService,private router : Router) { }

  ngOnInit() {
    this.getUserData();
    for (var i = 0; i < this.cardsCount.length; i++) {
      this.cardsCount[i] = "";
    }
    this.route.queryParams.subscribe(params => {
      this.subCategory = params['sub'];
      this.mainCategory = params['main'];
      this.setCategoryId();
      switch (this.subCategory) {
        case "Mobiles": {
          this.getMobileBrands();
          break;
        }
        case "Tablets": {
          this.getTabletBrands();
          break;
        }
      }
    });
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
    this.gadgetService.uploadGadgetImages(formData).subscribe((data: any) => {
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
    this.saveGadgetPost(payload);
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
  getMobileBrands() {
    this.gadgetService.getMobileBrands().subscribe(data => {
      this.brands = data;
      this.getFilteredBrands();
    });
  }
  getFilteredBrands() {
    this.filteredBrands = this.myControl.valueChanges.pipe(
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
  handleBrand(data: any) {
    this.brandId = data.id;
  }
  displayBrand(brand: any): string {
    return brand.brandName || "";
  }
  getTabletBrands() {
    this.gadgetService.getTabletBrands().subscribe(data => {
      this.brands = data;
      this.getFilteredBrands();
    })
  }
  saveGadgetPost(payload: any) {
    if (this.validatePostForm(payload))
      this.gadgetService.saveGadgetPost(payload).subscribe(data => {
        this.showNotification("Post added succesfully");
        console.log(data);
        this.router.navigateByUrl('/post-menu');
      });
  }
  addSpecificPayload(commonPayload: any): any {
    var imageList: { gadgetsId: number; imageId: string; imageURL: any; }[] = [];
    this.cardsCount.forEach(imageURL => {
      if (imageURL != "")
        imageList.push({ "gadgetsId": 0, "imageId": "100", "imageURL": imageURL });
    });
    var payload = Object.assign({}, commonPayload, {
      gadgetImageList: imageList,
      mobileBrandId: this.brandId
    });
    return payload;
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
              console.log(res);
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
    else if (payload.price < 10 || payload.price > 100000)
      this.showNotification("price should be min 10 and max 100000");
    else if (payload.gadgetImageList.length <= 0)
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
}
