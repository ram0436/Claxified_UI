import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessService } from 'src/app/modules/business/service/business.service';

type BizTab = 'all' | 'active' | 'pending' | 'draft' | 'archived';

@Component({
  selector: 'app-my-businesses',
  templateUrl: './my-businesses.component.html',
  styleUrls: ['./my-businesses.component.css'],
})
export class MyBusinessesComponent implements OnInit {
  isLoading = true;
  userId = 0;
  businesses: any[] = [];
  searchTerm = '';
  activeTab: BizTab = 'all';

  openMenuId: number | string | null = null;

  constructor(
    private businessService: BusinessService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id')) || 0;
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.isLoading = true;
    this.businessService.getUserBusinesses(this.userId).subscribe({
      next: (res: any) => {
        this.businesses = (res || []).map((b: any) => ({
          ...b,
          status: b.status || 'Active',
          productCount: b.productCount ?? 0,
          profileViews: b.profileViews ?? 0,
          enquiryCount: b.enquiryCount ?? 0,
        }));
        this.isLoading = false;
      },
      error: () => {
        this.businesses = [];
        this.isLoading = false;
      },
    });
  }

  setTab(tab: BizTab): void {
    this.activeTab = tab;
  }

  get filteredBusinesses(): any[] {
    let list = this.businesses;

    if (this.activeTab !== 'all') {
      const labelMap: Record<BizTab, string> = {
        all: '',
        active: 'Active',
        pending: 'Pending',
        draft: 'Draft',
        archived: 'Archived',
      };
      const target = labelMap[this.activeTab];
      list = list.filter((b) => (b.status || 'Active') === target);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      list = list.filter(
        (b: any) =>
          b.businessName?.toLowerCase().includes(term) ||
          b.categoryName?.toLowerCase().includes(term) ||
          b.city?.toLowerCase().includes(term),
      );
    }
    return list;
  }

  getLogo(business: any): string {
    return (
      business.logoUrl ||
      business.coverImageUrl ||
      '../../../../../assets/image_not_available.jpg'
    );
  }

  statusClass(status: string): string {
    const s = (status || 'Active').toLowerCase();
    if (s === 'active') return 'status-active';
    if (s === 'pending') return 'status-pending';
    if (s === 'draft') return 'status-draft';
    if (s === 'archived') return 'status-archived';
    return 'status-active';
  }

  manageBusiness(business: any): void {
    this.router.navigateByUrl(`/business/profile/${business.businessId}`);
  }

  addNewBusiness(): void {
    this.router.navigateByUrl('/business/profile/edit');
  }
}
