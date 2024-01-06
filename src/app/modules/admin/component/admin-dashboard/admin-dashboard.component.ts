import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from './../../../../shared/service/common.service';
import { AdminDashboardService } from '../../service/admin-dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
  selectedCategoryId! : number;
  allCards: any[] = [];
  mainCategories : any = [];
  title: string = '';
  message: string = '';

  validDescriptionMessage: boolean =false;

  constructor(private route: ActivatedRoute, private router: Router, private commonService: CommonService, private AdminDashboardService: AdminDashboardService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getMainCategories();
  }

  onSubmit() {

    this.validDescriptionMessage = this.message.length === 0;

    if (!this.validDescriptionMessage){

      const requestBody = {
        id: 0,
        title: this.title,
        message: this.message,
        createdBy: localStorage.getItem('id'),
        createdOn: new Date().toISOString()
      };
  
      this.AdminDashboardService.addDashboardMessage(requestBody).subscribe(
        (response: any) => {
          this.showNotification("Message Added Successfully");
        },
        (error: any) => {
          this.showNotification("Error Addin Message");
        }
      );

    }

  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
 

  getMainCategories() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.mainCategories = data; 
    });
  }

  getAdsByCategory(categoryId: number) {
    this.AdminDashboardService.getAdsByCategory(categoryId).subscribe((data: any) => {
      this.allCards = data;
    });
  }

  formatDate(date: any): any {
    const inputDate: Date = new Date(date);
    return moment(inputDate).format('MMM DD, YYYY');
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
  } else if (card.commercialServiceImageList && card.commercialServiceImageList[0]?.imageURL) {
      return card.commercialServiceImageList[0]?.imageURL;
  }
  else {
      return '../../../../../assets/image_not_available.jpg';
  }
}

navigateToDetails(data:any){
  let mainCategory = this.mainCategories.find((mainCategory:any)=>mainCategory.id == data.categoryId);
  if(mainCategory != null){
      this.router.navigateByUrl('/'+mainCategory.categoryName+'/post-details/'+data.tableRefGuid);
  }
}

getPostDetailsLink(card: any): any[] {
  const mainCategory = this.mainCategories.find((mainCategory: any) => mainCategory.id == card.categoryId);

  if (mainCategory != null) {
    return ['/' + mainCategory.categoryName + '/post-details', card.tableRefGuid];
  }

  return['/'];
}

generateNavigationUrl(mainCategory: string, subCategory: string, mode: string, categoryId: number, tableRefGuid: string): string {
    return `/${mainCategory}/add-post?main=${mainCategory}&sub=${subCategory}&mode=${mode}&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`;
  }

editCard(data: any) {
  localStorage.setItem('guid',data.tableRefGuid);
  let tableRefGuid = data.tableRefGuid;
  let categoryId = data.categoryId;
  let mainCategory = this.mainCategories.find((mainCategory:any)=>mainCategory.id == data.categoryId);
  if(mainCategory != null){
    let navigationUrl = '';
      switch(mainCategory.categoryName){
          case "Gadgets" : {
              this.router.navigateByUrl(`/Gadgets/add-post?main=Gadgets&sub=Mobiles&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Vehicles" : {
              this.router.navigateByUrl(`/Vehicles/add-post?main=Vehicles&sub=Cars&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Books" : {
              this.router.navigateByUrl(`/Books/add-post?main=Books&sub=Science & Technology&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Commercial Services" : {
              this.router.navigateByUrl(`/Commercial Services/add-post?main=Commercial Services&sub=Finance & Management&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Properties" : {
              this.router.navigateByUrl(`/Properties/add-post?main=Properties&sub=For Sale: Houses%20%26%20Apartments&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Jobs" : {
              this.router.navigateByUrl(`/Books/add-post?main=Books&sub=Science & Technology&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Electronics & Appliances" : {
              this.router.navigateByUrl(`/Electronics & Appliances/add-post?main=Electronics & Appliances&sub=TV&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Furniture" : {
              this.router.navigateByUrl(`/Books/add-post?main=Books&sub=Science & Technology&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Sports & Hobbies" : {
              this.router.navigateByUrl(`/Sports & Hobbies/add-post?main=Sports%20%26%20Hobbies&sub=Gym%20%26%20Fitness&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Pets" : {
              this.router.navigateByUrl(`/Books/add-post?main=Books&sub=Science & Technology&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
          case "Fashion" : {
              this.router.navigateByUrl(`/Fashion/add-post?main=Fashion&sub=Men&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`);
              break;
          }
      }
    }
  }
}
