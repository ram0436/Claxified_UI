import { Component } from '@angular/core';
import { BookService } from '../../service/book.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from '../../../user/component/login/login.component';
import { SignupComponent } from '../../../user/component/signup/signup.component'
import { CommonService } from 'src/app/shared/service/common.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css', '../../../module.component.css']
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
    { title: "Iphonr 10", price: 15000, state: "Telangana", city: "Hyderabad", nearBy: "Erragadda", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 11", price: 25000, state: "Telangana", city: "Hyderabad", nearBy: "Moosapet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 12", price: 35000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 13", price: 45000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 14", price: 55000, state: "Telangana", city: "Hyderabad", nearBy: "Ameerpet", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
    { title: "Iphonr 15", price: 65000, state: "Telangana", city: "Hyderabad", nearBy: "Punjagutta", imageUrl: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg" },
  ];
  itemsPerPage = 4;
  currentPage = 0;
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
  mainCategories : any = [];
  subCategories : any = [];

  constructor(private bookService: BookService, private route: ActivatedRoute, private router: Router, private dialog: MatDialog,
    private commonService : CommonService,private location :Location) { }

  ngOnInit() {
    this.getMainCategories();
    setTimeout(()=> this.getSubCategory(this.postDetails.categoryId),1000);
    var tableRefGuid;
    this.route.paramMap.subscribe((params) => {
      tableRefGuid = params.get('id');
    });
    if (tableRefGuid != null) {
      this.getSportPost(tableRefGuid);
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
    // this.router.navigate(['/Books/view-posts'], {
    //   queryParams: {
    //     type: 'Book',
    //     sub: 48
    //   }
    // });
    this.location.back();
  }
  getSportPost(guid: any) {
    this.bookService.getBookPostByGuid(guid).subscribe((data: any) => {
      this.postDetails = data[0];
      this.isLoading = false;
      this.imagesList = this.postDetails.bookImageList;
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
  getMainCategoryName(id:number){
    let mainCategory = this.mainCategories.find((cat:any)=>cat.id==id);
    return mainCategory !=null ? mainCategory.categoryName: "";
  }
  getSubCategoryName(id:number){
    let subCategory = this.subCategories.find((cat:any)=>cat.id==id);
    return subCategory !=null ? subCategory.subCategoryName: "";
  }
  getMainCategories(){
    this.commonService.getAllCategory().subscribe(res=>{
      this.mainCategories = res;
    })
  }
  getSubCategory(id:number){
    this.commonService.getSubCategoryByCategoryId(id).subscribe(res=>{
      this.subCategories = res;
    })
  }
}
