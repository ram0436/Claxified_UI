import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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

  readonly pageSize = 5;
  currentPage = 1;

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
      next: (list: any[]) => {
        const items = list || [];

        if (!items.length) {
          this.businesses = [];
          this.isLoading = false;
          return;
        }

        // Fetch details for every business in parallel.
        const detailCalls = items.map((b) =>
          this.businessService.getBusinessByGuid(b.businessId).pipe(
            catchError(() => of(null)), // one failure shouldn't kill all
          ),
        );

        forkJoin(detailCalls).subscribe((details) => {
          this.businesses = items.map((b, i) => {
            const d: any = details[i];

            const addr = d?.businessAddressDto;
            const location = addr
              ? [addr.city, addr.state].filter((v: any) => !!v).join(', ')
              : '';

            // Prefer logoUrl; fall back to coverImageUrl; then gallery; then placeholder
            const image =
              (b.logoUrl && b.logoUrl.trim()) ||
              (d?.logoUrl && d.logoUrl.trim()) ||
              (d?.coverImageUrl && d.coverImageUrl.trim()) ||
              d?.businessGalleryDtoList?.[0]?.imageUrl ||
              '../../../../../assets/image_not_available.jpg';

            return {
              ...b,
              status: d?.status === 1 ? 'Active' : 'Pending',
              categoryName: d?.businessCategory || '',
              businessType: d?.businessType || '',
              location,
              imageUrl: image,
              productCount: d?.productCount ?? 0,
              profileViews: d?.profileViews ?? 0,
              enquiryCount: d?.enquiryCount ?? 0,
            };
          });
          this.isLoading = false;
        });
      },
      error: () => {
        this.businesses = [];
        this.isLoading = false;
      },
    });
  }

  setTab(tab: BizTab): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
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
          b.location?.toLowerCase().includes(term),
      );
    }
    return list;
  }

  getLogo(business: any): string {
    return business.imageUrl || '../../../../../assets/image_not_available.jpg';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      '../../../../../assets/image_not_available.jpg';
  }

  getLocation(business: any): string {
    return business.location || '—';
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

  get totalFilteredCount(): number {
    return this.filteredBusinesses.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredCount / this.pageSize));
  }

  get currentPageSafe(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPages);
  }

  get pagedBusinesses(): any[] {
    const start = (this.currentPageSafe - 1) * this.pageSize;
    return this.filteredBusinesses.slice(start, start + this.pageSize);
  }

  get pageStart(): number {
    return this.totalFilteredCount === 0
      ? 0
      : (this.currentPageSafe - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(
      this.currentPageSafe * this.pageSize,
      this.totalFilteredCount,
    );
  }

  /** Compact page list with ellipses, e.g. [1, 2, 3, -1, 9, 10] */
  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPageSafe;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set<number>([1, total, current]);
    if (current - 1 > 1) pages.add(current - 1);
    if (current + 1 < total) pages.add(current + 1);

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push(-1);
      }
      result.push(sorted[i]);
    }
    return result;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // optional: scroll the card into view
    document.querySelector('.card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
