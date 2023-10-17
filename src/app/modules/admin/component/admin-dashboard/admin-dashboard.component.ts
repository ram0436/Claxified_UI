import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from './../../../../shared/service/common.service';
import { AdminDashboardService } from '../../service/admin-dashboard.service';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
  mainCategory: any[] = [];
  selectedCategoryId! : number;
  allCards: any[] = [];
  mainCategories : any = [];

  constructor(private route: ActivatedRoute, private router: Router, private commonService: CommonService, private AdminDashboardService: AdminDashboardService) { }

  ngOnInit() {
    this.getMainCategories();
  }

  getMainCategories() {
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.mainCategory = data; 
    });
  }

  getAdsByCategory(categoryId: number) {
    console.log(categoryId)
    this.AdminDashboardService.getAdsByCategory(categoryId).subscribe((data: any) => {
      this.allCards = data;
      console.log(this.allCards)
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

}
