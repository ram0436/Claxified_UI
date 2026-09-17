import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { CommonService } from 'src/app/shared/service/common.service';
import { AdminDashboardService } from '../../../admin/service/admin-dashboard.service';

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
})
export class AdminOverviewComponent implements OnInit {
  isLoading = true;
  isAdsLoading = false;

  mainCategories: any[] = [];
  selectedCategoryId: number | null = null;
  allCards: any[] = [];

  showMessagePanel = false;
  title = '';
  message = '';
  validDescriptionMessage = false;
  isSendingMessage = false;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private adminDashboardService: AdminDashboardService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // ---------- Categories + ads ----------

  loadCategories(): void {
    this.isLoading = true;
    this.commonService.getAllCategory().subscribe({
      next: (res: any) => {
        this.mainCategories = res || [];
        this.isLoading = false;
        if (this.mainCategories.length) {
          this.selectedCategoryId = this.mainCategories[0].id;
          this.getAdsByCategory(this.selectedCategoryId);
        }
      },
      error: () => {
        this.mainCategories = [];
        this.isLoading = false;
      },
    });
  }

  onCategoryChange(categoryId: string | number): void {
    this.selectedCategoryId = Number(categoryId);
    this.getAdsByCategory(this.selectedCategoryId);
  }

  getAdsByCategory(categoryId: number | null): void {
    if (!categoryId) {
      this.allCards = [];
      return;
    }
    this.isAdsLoading = true;
    console.log('Fetching ads for categoryId:', categoryId);
    this.adminDashboardService.getAdsByCategory(categoryId).subscribe({
      next: (data: any) => {
        this.allCards = Array.isArray(data) ? data : [];
        this.isAdsLoading = false;
      },
      error: () => {
        this.allCards = [];
        this.isAdsLoading = false;
      },
    });
  }

  get selectedCategoryName(): string {
    const cat = this.mainCategories.find(
      (c) => c.id === this.selectedCategoryId,
    );
    return cat ? cat.categoryName : '';
  }

  get totalCategories(): number {
    return this.mainCategories.length;
  }

  // ---------- Display helpers ----------

  formatDate(date: any): string {
    return moment(new Date(date)).format('MMM DD, YYYY');
  }

  getCardImageURL(card: any): string {
    if (card.gadgetImageList?.[0]?.imageURL)
      return card.gadgetImageList[0].imageURL;
    if (card.vehicleImageList?.[0]?.imageURL)
      return card.vehicleImageList[0].imageURL;
    if (card.electronicApplianceImageList?.[0]?.imageURL)
      return card.electronicApplianceImageList[0].imageURL;
    if (card.furnitureImageList?.[0]?.imageURL)
      return card.furnitureImageList[0].imageURL;
    if (card.sportImageList?.[0]?.imageURL)
      return card.sportImageList[0].imageURL;
    if (card.petImageList?.[0]?.imageURL) return card.petImageList[0].imageURL;
    if (card.fashionImageList?.[0]?.imageURL)
      return card.fashionImageList[0].imageURL;
    if (card.bookImageList?.[0]?.imageURL)
      return card.bookImageList[0].imageURL;
    if (card.propertyImageList?.[0]?.imageURL)
      return card.propertyImageList[0].imageURL;
    if (card.jobImageList?.[0]?.imageURL) return card.jobImageList[0].imageURL;
    if (card.commercialServiceImageList?.[0]?.imageURL)
      return card.commercialServiceImageList[0].imageURL;
    return '../../../../../assets/image_not_available.jpg';
  }

  // ---------- Navigation ----------

  navigateToDetails(data: any): void {
    const mainCategory = this.mainCategories.find(
      (c) => c.id == data.categoryId,
    );
    if (mainCategory) {
      this.router.navigateByUrl(
        `/${mainCategory.categoryName}/post-details/${data.tableRefGuid}`,
      );
    }
  }

  getPostDetailsLink(card: any): any[] {
    const mainCategory = this.mainCategories.find(
      (c) => c.id == card.categoryId,
    );
    if (mainCategory) {
      return [
        '/' + mainCategory.categoryName + '/post-details',
        card.tableRefGuid,
      ];
    }
    return ['/'];
  }

  editCard(data: any): void {
    localStorage.setItem('guid', data.tableRefGuid);
    const tableRefGuid = data.tableRefGuid;
    const categoryId = data.categoryId;
    const mainCategory = this.mainCategories.find(
      (c) => c.id == data.categoryId,
    );
    if (!mainCategory) return;

    const routes: Record<string, string> = {
      Gadgets: `/Gadgets/add-post?main=Gadgets&sub=Mobiles&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Vehicles: `/Vehicles/add-post?main=Vehicles&sub=Cars&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Books: `/Books/add-post?main=Books&sub=Science & Technology&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      'Commercial Services': `/Commercial Services/add-post?main=Commercial Services&sub=Finance & Management&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Properties: `/Properties/add-post?main=Properties&sub=For Sale: Houses%20%26%20Apartments&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Jobs: `/Jobs/add-post?main=Jobs&sub=Data Entry & Back Office&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Electronics: `/Electronics/add-post?main=Electronics&sub=TV&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Furniture: `/Furniture/add-post?main=Furniture&sub=Sofa & Dining&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Sports: `/Sports/add-post?main=Sports&sub=Gym%20%26%20Fitness&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Pets: `/Pets/add-post?main=Pets&sub=Fishes & Aquarium&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
      Fashion: `/Fashion/add-post?main=Fashion&sub=Men&mode=edit&fromAdmin=true&categoryId=${categoryId}&tableRefGuid=${tableRefGuid}`,
    };

    const url = routes[mainCategory.categoryName];
    if (url) this.router.navigateByUrl(url);
  }

  // ---------- Dashboard message ----------

  toggleMessagePanel(): void {
    this.showMessagePanel = !this.showMessagePanel;
    if (!this.showMessagePanel) {
      this.validDescriptionMessage = false;
    }
  }

  onSubmitMessage(): void {
    this.validDescriptionMessage = this.message.trim().length === 0;
    if (this.validDescriptionMessage) return;

    const requestBody = {
      id: 0,
      title: this.title,
      message: this.message,
      createdBy: localStorage.getItem('id'),
      createdOn: new Date().toISOString(),
    };

    this.isSendingMessage = true;
    this.adminDashboardService.addDashboardMessage(requestBody).subscribe({
      next: () => {
        this.isSendingMessage = false;
        this.title = '';
        this.message = '';
        this.showMessagePanel = false;
        this.showNotification('Message added successfully');
      },
      error: () => {
        this.isSendingMessage = false;
        this.showNotification('Error adding message');
      },
    });
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
