import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from '../../service/common.service';
import { SalaryPeriod } from '../../enum/SalaryPeriod';
import { LoginComponent } from '../../../modules/user/component/login/login.component';
import { SignupComponent } from '../../../modules/user/component/signup/signup.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/modules/user/service/user.service';
import { buildPostCommands } from 'src/app/shared/utils/post-url.util';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent implements OnInit, OnChanges {
  private _searchCards: any;

  @Input() set searchCards(value: any) {
    this._searchCards = value;
    this.updateCards();
  }

  @Input() isLoading: Boolean = false;
  @Input() cards: any;
  @Input() increaseHeight = false;
  @Input() increaseMargin = false;
  @Input() columns: number = 4;
  currentDate: Date = new Date();
  math = Math;

  isUserLogedIn: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;

  cardsImages: any[] = [];

  additionalHeightForYear = 10;

  // Pagination properties
  // pageSize = 20;
  currentPage = 0;
  totalPages = 0;
  paginatedCards: any[] = [];
  mainCategories: any = [];
  mainCategory: any;
  imageIndex: number = 0;
  imagesList: any = [1];

  combinedContent: string = '';

  displayedCardCount: number = 20;

  isScrolledDown = false;

  stateAbr: string = '';

  isFavorite: boolean = false;

  productId: string = '';
  categoryId: string = '';
  favoriteStatus: { [key: string]: boolean } = {};

  salaryPeriods = Object.keys(SalaryPeriod).map((key: any) => ({
    label: key,
    id: SalaryPeriod[key],
  }));

  categoryMapping: { [key: string]: string } = {
    '1': 'Gadgets',
    '2': 'Vehicles',
    '3': 'Properties',
    '4': 'Jobs',
    '5': 'Electronics & Appliances',
    '6': 'Furniture',
    '7': 'Books',
    '8': 'Sports & Hobbies',
    '9': 'Pets',
    '10': 'Fashion',
    '11': 'Commercial Services',
  };

  imageIndices: number[] = [];

  scrollToTop() {
    const scrollDuration = 300; // Duration of the scroll animation in milliseconds
    const scrollStep = -window.scrollY / (scrollDuration / 15); // Divide the scroll distance into smaller steps

    const scrollAnimation = () => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
        requestAnimationFrame(scrollAnimation); // Continue scrolling until reaching the top
      }
    };

    requestAnimationFrame(scrollAnimation);
  }

  get searchCards(): any {
    return this._searchCards;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cards'] || changes['searchCards']) {
      this.updateCards();
      this.getMainCategories();
    }
  }
  @HostListener('window:scroll', [])
  onScroll() {
    const scrolled = (window.scrollY || document.documentElement.scrollTop) > 0;
    if (scrolled !== this.isScrolledDown) {
      this.zone.runOutsideAngular(() => {
        this.isScrolledDown = scrolled;
        this.cdr.markForCheck();
      });
    }
  }

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private UserService: UserService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id') || '';
    });
  }

  ngOnInit() {
    this.updateCards();
    this.getMainCategories();
  }

  updateCards() {
    const source =
      (this.searchCards?.length ? this.searchCards : this.cards) || [];
    const slice = source.slice(0, this.displayedCardCount);
    this.decorate(slice);
    this.paginatedCards = slice;
    this.cdr.markForCheck();
  }

  private decorate(cards: any[]) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (this.mainCategories?.length) {
        const match = this.mainCategories.find(
          (c: any) => c.id == card.categoryId,
        );
        if (match) card.mainCategory = match.categoryName;
      }

      card.isFeatured = i === 0;
      if (card.imageIndex === undefined) card.imageIndex = 0;

      card._imagesList = this.resolveImagesList(card);
      card._imageUrl = this.getImageUrlFor(card);
    }
  }

  private getImageUrlFor(card: any): string {
    const list = card._imagesList || [];
    return (
      list[card.imageIndex || 0]?.imageURL ||
      '../../../assets/image_not_available.jpg'
    );
  }

  formatPrice(price: number): string {
    const roundedPrice = Math.round(price);

    const formattedPrice = roundedPrice.toLocaleString('en-IN');

    return formattedPrice;
  }

  getPostLink(card: any): any[] {
    return (
      buildPostCommands(card) ?? [
        '/classified-ads',
        this.getCategoryFromMapping(card.categoryId),
        'post-details',
        card.tableRefGuid,
      ]
    );
  }

  getCategoryFromMapping(categoryId: string): string {
    const category = this.categoryMapping[categoryId] || '';
    if (category.includes('Electronics & Appliances')) {
      return 'Electronics';
    } else if (category.includes('Sports & Hobbies')) {
      return 'Sports';
    } else {
      return category;
    }
  }

  toggleFavorite(event: Event, productId: string, categoryId: string) {
    event.preventDefault();
    event.stopPropagation();

    if (localStorage.getItem('id') != null) {
      this.favoriteStatus[productId] = this.favoriteStatus[productId] || false;

      this.favoriteStatus[productId] = !this.favoriteStatus[productId];

      if (this.favoriteStatus[productId]) {
        this.addToWishlist(productId, categoryId);
      } else {
      }
    } else {
      this.openLoginModal();
    }
  }

  addToWishlist(productId: string, categoryId: string) {
    const wishlistItem = {
      id: 0,
      productId: productId,
      categoryId: categoryId,
      createdBy: localStorage.getItem('id'),
      createdOn: new Date().toISOString(),
    };

    this.UserService.AddWishList(wishlistItem).subscribe(
      (response: any) => {},
      (error: any) => {
        // console.error("Error adding to Wishlist:", error);
      },
    );
  }

  openLoginModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(LoginComponent, {
      panelClass: 'login-dialog-container',
      autoFocus: false,
    });

    const dialogRefElement = document.querySelector('.custom-dialog-container');
    if (dialogRefElement) {
      dialogRefElement.setAttribute('style', 'margin-top: 85px');
    }

    this.dialogRef.afterClosed().subscribe((result) => {
      if (localStorage.getItem('authToken') != null) this.isUserLogedIn = true;
    });
  }

  showPrevious(event: Event, card: any) {
    event.preventDefault();
    event.stopPropagation();
    if (card.imageIndex > 0) {
      card.imageIndex--;
      card._imageUrl = this.getImageUrlFor(card);
      this.cdr.markForCheck();
    }
  }

  showNext(event: Event, card: any) {
    event.preventDefault();
    event.stopPropagation();
    const total = card._imagesList?.length || 0;
    if (card.imageIndex < total - 1) {
      card.imageIndex++;
      card._imageUrl = this.getImageUrlFor(card);
      this.cdr.markForCheck();
    }
  }
  isDisabled(card: any): boolean {
    const element = document.getElementById(`cardId${card.id}`)!;
    return element.classList.contains('disable');
  }

  handleDisabledClick() {}

  truncateTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) {
      return title;
    } else {
      return title.substring(0, maxLength) + '...';
    }
  }

  truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    } else {
      return content.substring(0, maxLength) + '...';
    }
  }

  truncateCity(city: string, maxLength: number = 28): string {
    if (city.length <= maxLength) {
      return city;
    } else {
      return city.substring(0, maxLength) + '...';
    }
  }

  loadMoreCards() {
    this.displayedCardCount += 20;
    const source =
      (this.searchCards?.length ? this.searchCards : this.cards) || [];
    const slice = source.slice(0, this.displayedCardCount);
    const newOnes = slice.slice(this.paginatedCards.length);
    this.decorate(newOnes);
    this.paginatedCards = slice;
    this.cdr.markForCheck();
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
  getMainCategories() {
    if (this.mainCategories?.length) return; // fetch once
    this.commonService.getAllCategory().subscribe((data: any) => {
      this.mainCategories = data;
      this.decorate(this.paginatedCards);
      this.cdr.markForCheck();
    });
  }
  getMainCategoryName(data: any) {
    for (var i = 0; i < this.mainCategories.length; i++) {
      if (this.mainCategories[i].id == data.categoryId) {
        this.mainCategory = this.mainCategories[i].categoryName;
        break;
      }
    }
  }

  getCardImageURL(card: any): string {
    const list = card._imagesList || [];
    return (
      list[card.imageIndex || 0]?.imageURL ||
      '../../../assets/image_not_available.jpg'
    );
  }

  setMainCategoryName(cards: any) {
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < this.mainCategories.length; j++) {
        if (cards[i].categoryId == this.mainCategories[j].id) {
          cards[i].mainCategory = this.mainCategories[j].categoryName;
          cards[i].isFeatured = i === 0;
          if (cards[i].imageIndex === undefined) cards[i].imageIndex = 0;

          cards[i]._imagesList = this.resolveImagesList(cards[i]);
          break;
        }
      }
    }
  }

  private resolveImagesList(card: any): any[] {
    const candidates = [
      card.gadgetImageList,
      card.vehicleImageList,
      card.electronicApplianceImageList,
      card.furnitureImageList,
      card.sportImageList,
      card.petImageList,
      card.fashionImageList,
      card.bookImageList,
      card.propertyImageList,
      card.jobImageList,
      card.commercialServiceImageList,
      card.commercialServiceImagesList,
    ];
    for (const list of candidates) {
      if (list && list[0]?.imageURL) return list;
    }
    return [];
  }

  getSalaryPeriod(id: number) {
    let selectedSalaryPeriod = this.salaryPeriods.filter(
      (salaryPeriod) => Number(salaryPeriod.id) == id,
    );
    if (selectedSalaryPeriod.length > 0) return selectedSalaryPeriod[0].label;
    return '';
  }

  stateAbbreviation(stateName: string): string {
    switch (stateName) {
      case 'Andhra Pradesh':
        return 'AP';
      case 'Arunachal Pradesh':
        return 'AR';
      case 'Assam':
        return 'AS';
      case 'Bihar':
        return 'BR';
      case 'Chhattisgarh':
        return 'CG';
      case 'Goa':
        return 'GA';
      case 'Gujarat':
        return 'GJ';
      case 'Haryana':
        return 'HR';
      case 'Himachal Pradesh':
        return 'HP';
      case 'Jammu and Kashmir':
        return 'JK';
      case 'Jharkhand':
        return 'JH';
      case 'Karnataka':
        return 'KA';
      case 'Kerala':
        return 'KL';
      case 'Madhya Pradesh':
        return 'MP';
      case 'Maharashtra':
        return 'MH';
      case 'Manipur':
        return 'MN';
      case 'Meghalaya':
        return 'ML';
      case 'Mizoram':
        return 'MZ';
      case 'Nagaland':
        return 'NL';
      case 'Orissa':
        return 'OR';
      case 'Punjab':
        return 'PB';
      case 'Rajasthan':
        return 'RJ';
      case 'Sikkim':
        return 'SK';
      case 'Tamil Nadu':
        return 'TN';
      case 'Tripura':
        return 'TR';
      case 'Uttarakhand':
        return 'UK';
      case 'Uttar Pradesh':
        return 'UP';
      case 'West Bengal':
        return 'WB';
      case 'Andaman and Nicobar Islands':
        return 'AN';
      case 'Chandigarh':
        return 'CH';
      case 'Dadra and Nagar Haveli':
        return 'DH';
      case 'Daman and Diu':
        return 'DD';
      case 'Delhi':
        return 'DL';
      case 'Lakshadweep':
        return 'LD';
      case 'Pondicherry':
        return 'PY';
      default:
        return stateName;
    }
  }
}
