import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/shared/service/common.service';
import { UserService } from '../../service/user.service';

@Component({
    selector: 'app-my-adds',
    templateUrl: './my-adds.component.html',
    styleUrls: ['./my-adds.component.css']
})
export class MyAddsComponent {

    @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef | undefined;

    constructor(private commonService: CommonService, private UserService: UserService, private router : Router,private elementRef: ElementRef) { }

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

  // Call this function when you want to scroll the element to the right
  scrollRight() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft += 50; // Adjust the scroll distance as needed
    }
  }

  // Call this function when you want to scroll the element to the left
  scrollLeft() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft -= 50; // Adjust the scroll distance as needed
    }
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
    closeMenu(id: number) {
        this.isMenuOpen = !this.isMenuOpen;
        this.selectedId = id;
    }
    confirmDelete(ad: any): void {
        const category = this.getCategoryName(ad);
        if (confirm('Are you sure you want to delete this ad?')) {
          this.deleteAd(ad.id, category);
        }
      }
    
    deleteAd(adId: number, category: string): void {
        this.UserService.deleteAd(adId, category).subscribe(
          (response) => {
            // console.log('Ad deleted successfully:', response);
            this.getAllAds();
            window.location.reload();
          },
          (error) => {
          }
        );
      }  

    getCategoryName(ad: any): string {
        const mainCategory = this.mainCategories.find((mainCategory: any) => mainCategory.id === ad.categoryId);
        if (mainCategory) {
          switch (mainCategory.categoryName) {
            case "Gadgets": return 'Gadget';
            case "Vehicles": return 'Vehicle';
            case "Books": return 'Book';
            case "Commercial Services": return 'CommercialService';
            case "Properties": return 'Property';
            case "Jobs": return 'Job';
            case "Electronics & Appliances": return 'ElectricAppliance';
            case "Furniture": return 'Furniture';
            case "Sports & Hobbies": return 'Sport';
            case "Pets": return 'Pet';
            case "Fashion": return 'Fashion';
            default: return ''; 
          }
        } else {
          return '';
        }
      }

    editAd(data: any) {
        localStorage.setItem('guid',data.tableRefGuid);
        let mainCategory = this.mainCategories.find((mainCategory:any)=>mainCategory.id == data.categoryId);
        if(mainCategory != null){
            switch(mainCategory.categoryName){
                case "Gadgets" : {
                    this.router.navigateByUrl('/Gadgets/add-post?main=Gadgets&mode=edit&sub=Mobiles');
                    break;
                }
                case "Vehicles" : {
                    this.router.navigateByUrl('/Vehicles/add-post?main=Vehicles&mode=edit&sub=Cars');
                    break;
                }
                case "Books" : {
                    this.router.navigateByUrl('/Books/add-post?main=Books&mode=edit&sub=Science %26 Technology');
                    break;
                }
                case "Commercial Services" : {
                    this.router.navigateByUrl('/Commercial Services/add-post?main=Commercial Services&mode=edit&sub=Finance %26 Management');
                    break;
                }
                case "Properties" : {
                    this.router.navigateByUrl('/Properties/add-post?main=Properties&mode=edit&sub=For Sale: Houses %26 Apartments');
                    break;
                }
                case "Jobs" : {
                    this.router.navigateByUrl('/Jobs/add-post?main=Jobs&mode=edit&sub=Data Entry %26 Back Office');
                    break;
                }
                case "Electronics & Appliances" : {
                    this.router.navigateByUrl('/Electronics %26 Appliances/add-post?main=Electronics %26 Appliances&mode=edit&sub=TV');
                    break;
                }
                case "Furniture" : {
                    this.router.navigateByUrl('/Furniture/add-post?main=Furniture&mode=edit&sub=Sofa %26 Dining');
                    break;
                }
                case "Sports & Hobbies" : {
                    this.router.navigateByUrl('/Sports %26 Hobbies/add-post?main=Sports %26 Hobbies&mode=edit&sub=Gym %26 Fitness');
                    break;
                }
                case "Pets" : {
                    this.router.navigateByUrl('/Pets/add-post?main=Pets&mode=edit&sub=Fishes %26 Aquarium');
                    break;
                }
                case "Fashion" : {
                    this.router.navigateByUrl('/Fashion/add-post?main=Fashion&mode=edit&sub=Men');
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
