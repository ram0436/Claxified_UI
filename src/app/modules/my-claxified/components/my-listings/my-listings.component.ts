import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/service/common.service';
import { UserService } from 'src/app/modules/user/service/user.service';
import { ClaxifiedHelperService } from '../../services/claxified-helper.service';

type TabKey = 'all' | 'active' | 'pending' | 'inactive';

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.css'],
})
export class MyListingsComponent implements OnInit, AfterViewInit {
  isLoading = true;
  userId = 0;

  allAds: any[] = [];
  mainCategories: any[] = [];

  searchTerm = '';
  categoryFilter = 'all';
  activeTab: TabKey = 'all';

  pageSize = 5;
  currentPage = 1;

  openMenuId: number | null = null;

  tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All Listings' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'inactive', label: 'Inactive' },
  ];

  @ViewChild('pagesScroll') pagesScroll?: ElementRef<HTMLDivElement>;

  canScrollLeft = false;
  canScrollRight = false;

  constructor(
    private commonService: CommonService,
    private userService: UserService,
    private helper: ClaxifiedHelperService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id')) || 0;
    this.commonService.getAllCategory().subscribe({
      next: (res: any) => {
        this.mainCategories = res || [];
        this.loadAds();
      },
      error: () => this.loadAds(),
    });
  }

  ngAfterViewInit(): void {
    // initial check once pages render
    setTimeout(() => this.updateScrollState());
  }

  scrollPages(direction: 'left' | 'right'): void {
    const el = this.pagesScroll?.nativeElement;
    if (!el) return;
    const amount = 160; // px per click — roughly 4 page buttons
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  onPagesScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const el = this.pagesScroll?.nativeElement;
    if (!el) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      return;
    }
    this.canScrollLeft = el.scrollLeft > 2;
    this.canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      setTimeout(() => this.updateScrollState());
    }
  }

  loadAds(): void {
    this.isLoading = true;
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
      __module: this.helper.getModuleForCategory(
        this.helper.getCategoryName(ad, this.mainCategories),
      ),
      __status: this.helper.getStatusLabel(ad),
    }));
  }

  get filteredAds(): any[] {
    let ads = this.decoratedAds;

    if (this.activeTab === 'active') {
      ads = ads.filter((a) => a.__status === 'Active');
    } else if (this.activeTab === 'pending') {
      ads = ads.filter((a) => a.__status === 'Pending Approval');
    } else if (this.activeTab === 'inactive') {
      ads = ads.filter((a) => a.__status === 'Inactive');
    }

    if (this.categoryFilter !== 'all') {
      ads = ads.filter((a) => a.__category === this.categoryFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      ads = ads.filter(
        (a) =>
          a.__title?.toLowerCase().includes(term) ||
          a.__location?.toLowerCase().includes(term) ||
          a.__category?.toLowerCase().includes(term),
      );
    }

    return ads;
  }

  get pagedAds(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAds.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAds.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  countFor(tab: TabKey): number {
    const ads = this.decoratedAds;
    if (tab === 'all') return ads.length;
    if (tab === 'active')
      return ads.filter((a) => a.__status === 'Active').length;
    if (tab === 'pending')
      return ads.filter((a) => a.__status === 'Pending Approval').length;
    return ads.filter((a) => a.__status === 'Inactive').length;
  }

  setTab(tab: TabKey): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  viewDetails(ad: any): void {
    this.router.navigateByUrl(
      `/classified-ads/${ad.__category}/post-details/${ad.tableRefGuid}`,
    );
  }

  createListing(): void {
    this.router.navigateByUrl('/post-menu');
  }

  getCategoryEntityName(ad: any): string {
    const mainCategory = this.mainCategories.find(
      (c: any) => c.id === ad.categoryId,
    );
    if (!mainCategory) return '';
    switch (mainCategory.categoryName) {
      case 'Gadgets':
        return 'Gadget';
      case 'Vehicles':
        return 'Vehicle';
      case 'Books':
        return 'Book';
      case 'Commercial Services':
        return 'CommercialService';
      case 'Properties':
        return 'Property';
      case 'Jobs':
        return 'Job';
      case 'Electronics & Appliances':
        return 'ElectricAppliance';
      case 'Furniture':
        return 'Furniture';
      case 'Sports & Hobbies':
        return 'Sport';
      case 'Pets':
        return 'Pet';
      case 'Fashion':
        return 'Fashion';
      default:
        return '';
    }
  }

  editAd(ad: any): void {
    localStorage.setItem('guid', ad.tableRefGuid);
    const mainCategory = this.mainCategories.find(
      (c: any) => c.id == ad.categoryId,
    );
    if (!mainCategory) return;

    switch (mainCategory.categoryName) {
      case 'Gadgets':
        this.router.navigateByUrl(
          'classified-ads/Gadgets/add-post?main=Gadgets&mode=edit&sub=Mobiles',
        );
        break;
      case 'Vehicles':
        this.router.navigateByUrl(
          'classified-ads/Vehicles/add-post?main=Vehicles&mode=edit&sub=Cars',
        );
        break;
      case 'Books':
        this.router.navigateByUrl(
          'classified-ads/Books/add-post?main=Books&mode=edit&sub=Science %26 Technology',
        );
        break;
      case 'Commercial Services':
        this.router.navigateByUrl(
          'classified-ads/Commercial Services/add-post?main=Commercial Services&mode=edit&sub=Finance %26 Management',
        );
        break;
      case 'Properties':
        this.router.navigateByUrl(
          'classified-ads/Properties/add-post?main=Properties&mode=edit&sub=For Sale: Houses %26 Apartments',
        );
        break;
      case 'Jobs':
        this.router.navigateByUrl(
          'classified-ads/Jobs/add-post?main=Jobs&mode=edit&sub=Data Entry %26 Back Office',
        );
        break;
      case 'Electronics & Appliances':
        this.router.navigateByUrl(
          'classified-ads/Electronics %26 Appliances/add-post?main=Electronics %26 Appliances&mode=edit&sub=TV',
        );
        break;
      case 'Furniture':
        this.router.navigateByUrl(
          'classified-ads/Furniture/add-post?main=Furniture&mode=edit&sub=Sofa %26 Dining',
        );
        break;
      case 'Sports & Hobbies':
        this.router.navigateByUrl(
          'classified-ads/Sports %26 Hobbies/add-post?main=Sports %26 Hobbies&mode=edit&sub=Gym %26 Fitness',
        );
        break;
      case 'Pets':
        this.router.navigateByUrl(
          'classified-ads/Pets/add-post?main=Pets&mode=edit&sub=Fishes %26 Aquarium',
        );
        break;
      case 'Fashion':
        this.router.navigateByUrl(
          'classified-ads/Fashion/add-post?main=Fashion&mode=edit&sub=Men',
        );
        break;
    }
  }

  confirmDelete(ad: any): void {
    const entity = this.getCategoryEntityName(ad);
    if (!entity) return;
    if (confirm(`Delete "${ad.__title}"? This action cannot be undone.`)) {
      this.userService.deleteAd(ad.id, entity).subscribe({
        next: () => this.loadAds(),
        error: () => alert('Could not delete this listing. Please try again.'),
      });
    }
    this.openMenuId = null;
  }
}
