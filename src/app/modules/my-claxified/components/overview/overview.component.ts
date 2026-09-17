import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/service/common.service';
import { BusinessService } from 'src/app/modules/business/service/business.service';
import { ClaxifiedHelperService } from '../../services/claxified-helper.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  isLoading = true;
  userId = 0;
  userName = 'there';

  allAds: any[] = [];
  mainCategories: any[] = [];
  businesses: any[] = [];

  constructor(
    private commonService: CommonService,
    private businessService: BusinessService,
    private helper: ClaxifiedHelperService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id')) || 0;
    this.userName = localStorage.getItem('firstName') || 'there';

    this.commonService.getAllCategory().subscribe({
      next: (res: any) => {
        this.mainCategories = res || [];
        this.loadAds();
      },
      error: () => this.loadAds(),
    });

    this.businessService.getUserBusinesses(this.userId).subscribe({
      next: (res: any) => (this.businesses = res || []),
      error: () => (this.businesses = []),
    });
  }

  loadAds(): void {
    this.commonService.getAllAdsByUserId(this.userId).subscribe({
      next: (res: any) => {
        this.allAds = Array.isArray(res) ? res : [];
        this.isLoading = false;
      },
      error: () => {
        this.allAds = [];
        this.isLoading = false;
      },
    });
  }

  get decoratedAds(): any[] {
    return this.allAds.map((ad) => ({
      ...ad,
      __title: this.helper.getAdTitle(ad),
      __location: this.helper.getAdLocation(ad),
      __image: this.helper.getCardImageURL(ad),
      __category: this.helper.getCategoryName(ad, this.mainCategories),
      __status: this.helper.getStatusLabel(ad),
    }));
  }

  get recentAds(): any[] {
    return this.decoratedAds.slice(0, 5);
  }

  get activeCount(): number {
    return this.decoratedAds.filter((a) => a.__status === 'Active').length;
  }

  get pendingCount(): number {
    return this.decoratedAds.filter((a) => a.__status === 'Pending Approval')
      .length;
  }

  get totalListings(): number {
    return this.allAds.length;
  }

  get totalBusinesses(): number {
    return this.businesses.length;
  }

  goToListings(): void {
    this.router.navigateByUrl('/my-claxified/my-listings');
  }

  goToBusinesses(): void {
    this.router.navigateByUrl('/my-claxified/my-businesses');
  }

  createListing(): void {
    this.router.navigateByUrl('/post-menu');
  }

  viewDetails(ad: any): void {
    this.router.navigateByUrl(`/${ad.__category}/post-details/${ad.tableRefGuid}`);
  }
}
