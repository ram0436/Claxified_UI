import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
    selector: 'app-my-adds',
    templateUrl: './my-adds.component.html',
    styleUrls: ['./my-adds.component.css']
})
export class MyAddsComponent {

    constructor(private commonService: CommonService,private router : Router,private elementRef: ElementRef) { }

    userId: any = 0;
    allAds: any = [];
    activeAds: any = [];
    pendingAds : any = [];
    inActiveAds : any = [];
    addImage: any;
    isMenuOpen: boolean = false;
    selectedId: any;
    mainCategories : any = [];

    ngOnInit() {
        this.userId = localStorage.getItem('id');
        this.getAllAds();
        this.getMainCategory();
    }
    formatDate(date: any): any {
        const inputDate: Date = new Date(date);
        return moment(inputDate).format('MMM DD, YYYY');
    }
    getAllAds() {
        this.commonService.getAllAdsByUserId(this.userId).subscribe(res => {
            this.allAds = res;
            this.activeAds = this.allAds.filter((ad:any)=>ad.isActive == true);
        })
    }
    getCardImageURL(card: any): string {
        if (card.gadgetImageList && card.gadgetImageList[0]?.imageURL) {
            return card.gadgetImageList[0]?.imageURL;
        } else if (card.vehicleImageList && card.vehicleImageList[0]?.imageURL) {
            return card.vehicleImageList[0]?.imageURL;
        } else if (card.electronicApplianceImageList && card.electronicApplianceImageList[0]?.imageURL) {
            return card.electronicApplianceImageList[0]?.imageURL;
        } else if (card.furnitureImageList && card.furnitureImageList[0]?.imageURL) {
            return card.furnitureImageList[0]?.imageURL;
        } else if (card.sportImageList && card.sportImageList[0]?.imageURL) {
            return card.sportImageList[0]?.imageURL;
        } else if (card.petImageList && card.petImageList[0]?.imageURL) {
            return card.petImageList[0]?.imageURL;
        } else if (card.fashionImageList && card.fashionImageList[0]?.imageURL) {
            return card.fashionImageList[0]?.imageURL;
        } else if (card.bookImageList && card.bookImageList[0]?.imageURL) {
            return card.bookImageList[0]?.imageURL;
        } else if (card.propertyImageList && card.propertyImageList[0]?.imageURL) {
            return card.propertyImageList[0]?.imageURL;
        } else if (card.jobImageList && card.jobImageList[0]?.imageURL) {
            return card.jobImageList[0]?.imageURL;
        } else if (card.commercialServiceImagesList && card.commercialServiceImagesList[0]?.imageURL) {
            return card.commercialServiceImagesList[0]?.imageURL;
        }
        else {
            return '../../../../../assets/image_not_available.jpg';
        }
    }
    toggleMenu(id: number) {
        this.isMenuOpen = !this.isMenuOpen;
        this.selectedId = id;
    }
    editAd(data: any) {
        localStorage.setItem('guid',data.tableRefGuid);
        let mainCategory = this.mainCategories.find((mainCategory:any)=>mainCategory.id == data.categoryId);
        if(mainCategory != null){
            switch(mainCategory.categoryName){
                case "Gadgets" : {
                    this.router.navigateByUrl('/Gadgets/add-post?main=Gadgets&sub=Mobiles&mode=edit');
                    break;
                }
                case "Vehicles" : {
                    this.router.navigateByUrl('/Vehicles/add-post?main=Vehicles&sub=Cars&mode=edit');
                    break;
                }
                case "Books" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&sub=Science & Technology&mode=edit');
                    break;
                }
                case "Commercial Services" : {
                    this.router.navigateByUrl('/Commercial Services/add-post?main=Commercial Services&sub=Finance & Management&mode=edit');
                    break;
                }
                case "Properties" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&sub=Science & Technology&mode=edit');
                    break;
                }
                case "Jobs" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&sub=Science & Technology&mode=edit');
                    break;
                }
                case "Electronics & Appliances" : {
                    this.router.navigateByUrl('/Electronics & Appliances/add-post?main=Electronics & Appliances&sub=TV&mode=edit');
                    break;
                }
                case "Furniture" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&sub=Science & Technology&mode=edit');
                    break;
                }
                case "Sports & Hobbies" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&sub=Science & Technology&mode=edit');
                    break;
                }
                case "Pets" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&sub=Science & Technology&mode=edit');
                    break;
                }
                case "Fashion" : {
                    this.router.navigateByUrl('/Fashion/add-post?main=Fashion&sub=Men&mode=edit');
                    break;
                }
            }
        // this.commonService.getSubCategoryByCategoryId(data.categoryId).subscribe((res:any)=>{
        //     let subCategory = res.find((subCategory:any)=>subCategory.id == data.subCategoryId);
        //     if(subCategory != null)
        //     this.router.navigateByUrl('/'+mainCategory.categoryName+'/add-post?main='+mainCategory.categoryName+'&sub='+subCategory+'&mode=edit')
        // });
        //this.router.navigateByUrl('/Gadgets/add-post?main=Gadgets&sub=Mobiles&mode=edit')
    }
    }
    onTabChanged(event: any) {
        if (event.index == 0) {
            this.activeAds = this.allAds.filter((ad: any) => ad.isActive == true && ad.isVerified ==true);
        } else if (event.index == 1)
            this.inActiveAds = this.allAds.filter((ad: any) => ad.isActive == false && ad.isVerified ==true);
        else
            this.pendingAds = this.allAds.filter((ad: any) => ad.isVerified == false);
    }
    getMainCategory(){
        this.commonService.getAllCategory().subscribe(res=>{
            this.mainCategories = res;
        });
    }
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isMenuOpen = false;
      }
    }
    navigateToDetails(data:any){
        let mainCategory = this.mainCategories.find((mainCategory:any)=>mainCategory.id == data.categoryId);
        if(mainCategory != null){
            this.router.navigateByUrl('/'+mainCategory.categoryName+'/post-details/'+data.tableRefGuid);
        }
    }
}
