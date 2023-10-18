import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/modules/user/service/user.service';
import { Common } from 'src/app/shared/model/CommonPayload';
import { CommonService } from 'src/app/shared/service/common.service';
import { JobService } from '../../service/job.service';
import { SalaryPeriod } from 'src/app/shared/enum/SalaryPeriod';
import { PositionType } from 'src/app/shared/enum/PositionType';
import { AdminDashboardService } from './../../../admin/service/admin-dashboard.service';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css', '../../../moduleaddpost.component.css']
})
export class AddPostComponent {

  cardsCount: any[] = new Array(10);
  currentImageIndex: any = 0;
  numericValue: number = 0;
  selectedImage: string = "";
  commonPayload: Common = new Common();
  subCategory: string = '';
  mainCategory: string = '';
  currentUploadImageIndex: number = 0;
  allUploadedFiles: any = [];
  progress: boolean = false;
  userData: any;
  imageUrl: string = '../../../../../assets/img_not_available.png';
  salaryPeriods = Object.keys(SalaryPeriod).map((key: any) => ({
    label: key,
    id: SalaryPeriod[key],
    selected : false
  }));
  positionTypes = Object.keys(PositionType).map((key: any) => ({
    label: key,
    id: PositionType[key],
    selected : false
  }));
  firstImageUploaded: boolean = false; // Changes made by Hamza
  isFromAdmin: boolean = false;
  jobData: any = {
    salaryPeriodType: 0,
    positionType: 0,
    salaryFrom: 0,
    salaryTo: 0
  }
  constructor(private jobService: JobService, private commonService: CommonService, private snackBar: MatSnackBar, private route: ActivatedRoute, private AdminDashboardService: AdminDashboardService,
    @Inject(DOCUMENT) private document: Document, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isFromAdmin = params['fromAdmin'] === 'true';
    });
    this.salaryPeriods = this.salaryPeriods.slice(this.salaryPeriods.length / 2);
    this.positionTypes = this.positionTypes.slice(this.positionTypes.length / 2);
    this.getUserData();
    for (var i = 0; i < this.cardsCount.length; i++) {
      this.cardsCount[i] = "";
    }
    this.route.queryParams.subscribe(params => {
      this.subCategory = params['sub'].replaceAll("%20", " ");
      this.mainCategory = params['main'].replaceAll("%20", " ");
      this.setCategoryId();
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
    this.jobService.uploadJobImages(formData).subscribe((data: any) => {
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
    this.saveJobPost(payload);
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
  saveJobPost(payload: any) {
    if (this.validatePostForm(payload))
      this.jobService.saveJobPost(payload).subscribe(data => {
        this.showNotification("Post added succesfully");
        this.router.navigateByUrl('/post-menu');
      });
  }
  addSpecificPayload(commonPayload: any): any {
    var imageList: { jobsId: number; imageId: string; imageURL: any; }[] = [];
    this.cardsCount.forEach(imageURL => {
      if (imageURL != "")
        imageList.push({ "jobsId": 0, "imageId": "100", "imageURL": imageURL });
    });
    var payload = Object.assign({}, commonPayload, {
      jobImageList: imageList,
      salaryPeriodType: this.jobData.salaryPeriodType,
      positionType: this.jobData.positionType,
      salaryFrom: this.jobData.salaryFrom ==0 ? 0 : Number(this.jobData.salaryFrom),
      salaryTo: this.jobData.salaryTo ==0 ? 0 : Number(this.jobData.salaryTo)
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
            })
          }
        })
      }
    })
  }
  validatePostForm(payload: any): boolean {
    let flag = false;
    if(payload.salaryPeriodType <=0)
      this.showNotification("salary period is required");
    else if(payload.positionType <=0)
      this.showNotification("position type is required");
    else if (payload.title == "")
      this.showNotification("Title is required");
    else if (payload.title.length < 15 || payload.title.length > 50)
      this.showNotification("Title should be min 15 and max of 50 charecters");
    else if (payload.discription == "")
      this.showNotification("discription is required");
    else if (payload.discription.length < 15 || payload.discription.length > 500)
      this.showNotification("discription should be min 15 and max 500 charecters");
    else if (payload.jobImageList.length <= 0)
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
  selectSalaryPeriod(salaryPeriod: any) {
    salaryPeriod.selected = !salaryPeriod.selected;
    if (salaryPeriod.selected)
      this.jobData.salaryPeriodType = salaryPeriod.id;
    else
      this.jobData.salaryPeriodType = 0;
  }
  selectPositionType(positionType: any) {
    positionType.selected = !positionType.selected;
    if (positionType.selected)
      this.jobData.positionType = positionType.id;
    else
      this.jobData.positionType = 0
  }
}
