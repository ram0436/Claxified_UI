import { Component, Input, OnInit, HostListener } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from '../../service/common.service';
import { SalaryPeriod } from '../../enum/SalaryPeriod';
import { LoginComponent } from '../../../modules/user/component/login/login.component';
import { SignupComponent } from '../../../modules/user/component/signup/signup.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/modules/user/service/user.service';

@Component({
    selector: 'app-post-card',
    templateUrl: './post-card.component.html',
    styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit {

    @Input() isLoading: Boolean = false;
    @Input() cards: any;
    @Input() increaseHeight = false;
    currentDate: Date = new Date();
    math = Math;

    isUserLogedIn: boolean = false;
    dialogRef: MatDialogRef<any> | null = null;

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

    stateAbr: string = "";

    isFavorite: boolean = false;

    productId: string = '';
    categoryId: string = '';
    favoriteStatus: { [key: string]: boolean } = {};

    salaryPeriods = Object.keys(SalaryPeriod).map((key: any) => ({
        label: key,
        id: SalaryPeriod[key],
      }));

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
  
    @HostListener('window:scroll', [])
    onScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      this.isScrolledDown = scrollY > 0;
    }
  
    constructor(private router: Router, private commonService: CommonService, private route: ActivatedRoute, private dialog: MatDialog,private UserService : UserService) { 
      this.route.paramMap.subscribe(params => {
        this.productId = params.get('id') || '';
      }); } 

    ngOnInit() {
        this.paginatedCards = this.cards.slice(0, this.displayedCardCount);
        // console.log(this.paginatedCards);
        this.getMainCategories();

        // if (this.cards.length > 0) {
        //     this.stateAbbreviation(this.cards[0]); // Call it with the first card as an example
        //   }

    }

formatPrice(price: number): string {
  const roundedPrice = Math.round(price);

  const formattedPrice = roundedPrice.toLocaleString('en-IN');

  return formattedPrice;
}

// toggleFavorite(event: Event) {

//   if (localStorage.getItem('id') != null)
//   {
//     event.preventDefault(); 
//     event.stopPropagation();
//     this.isFavorite = !this.isFavorite;
//   }
//   else{
//     event.preventDefault(); 
//     event.stopPropagation();
//     this.openLoginModal();
//   }
// }

toggleFavorite(event: Event, productId: string, categoryId: string) {
  event.preventDefault();
  event.stopPropagation();


  if (localStorage.getItem('id') != null) {
    // Check if the card has a favorite status, if not, set it to false
    this.favoriteStatus[productId] = this.favoriteStatus[productId] || false;

    // Toggle the favorite status for the specific card
    this.favoriteStatus[productId] = !this.favoriteStatus[productId];

    if (this.favoriteStatus[productId]) {
      this.addToWishlist(productId, categoryId);
    } else {
      // Remove from wishlist API call (if applicable)
      // Implement this method if you have a remove from wishlist functionality
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
    createdOn: new Date().toISOString()
  };

  // console.log('Request Payload:', wishlistItem);

  this.UserService.AddWishList(wishlistItem).subscribe(
    (response: any) => {
      // Handle success response, if needed
      console.log('API Response:', response);
    },
    (error: any) => {
      console.error('Error adding to Wishlist:', error);
    }
  );
}


openLoginModal() {

  if (this.dialogRef) {
    this.dialogRef.close();
  }

  this.dialogRef = this.dialog.open(LoginComponent, { width: '500px' });

  this.dialogRef.afterClosed().subscribe(result => {
    if (localStorage.getItem("authToken") != null)
      this.isUserLogedIn = true;
  });
}



    truncateTitle(title: string, maxLength: number = 32): string {
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

      truncateCity(city: string, maxLength: number = 27): string {
        if (city.length <= maxLength) {
          return city;
        } else {
          return city.substring(0, maxLength) + '...';
        }
      }

    loadMoreCards() {
        this.displayedCardCount += 20; // Increase the count for the next set of cards
        this.paginatedCards = this.cards.slice(0, this.displayedCardCount);
        this.setMainCategoryName(this.paginatedCards);
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
    // onPageChange(event: PageEvent): void {
    //     this.currentPage = event.pageIndex;
    //     this.calculatePagination();
    // }
    // calculatePagination() {
    //     this.totalPages = Math.ceil(this.cards.length / this.pageSize);
    //     this.paginatedCards = this.cards.slice(
    //         this.currentPage * this.pageSize,
    //         (this.currentPage + 1) * this.pageSize
    //     );
    // }
    getMainCategories() {
        this.commonService.getAllCategory().subscribe((data: any) => {
            this.mainCategories = data;
            this.setMainCategoryName(this.paginatedCards);
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
        this.imagesList = [];
        if (card.gadgetImageList && card.gadgetImageList[0]?.imageURL) {
            this.imagesList = card.gadgetImageList;
            return card.gadgetImageList[0]?.imageURL;
        } else if (card.vehicleImageList && card.vehicleImageList[0]?.imageURL) {
            this.imagesList = card.vehicleImageList;
            return card.vehicleImageList[0]?.imageURL;
        } else if (card.electronicApplianceImageList && card.electronicApplianceImageList[0]?.imageURL) {
            this.imagesList = card.electronicApplianceImageList;
            return card.electronicApplianceImageList[0]?.imageURL;
        } else if (card.furnitureImageList && card.furnitureImageList[0]?.imageURL) {
            this.imagesList = card.furnitureImageList;
            return card.furnitureImageList[0]?.imageURL;
        }else if (card.sportImageList && card.sportImageList[0]?.imageURL) {
            this.imagesList = card.sportImageList;
            return card.sportImageList[0]?.imageURL;
        }else if (card.petImageList && card.petImageList[0]?.imageURL) {
            this.imagesList = card.petImageList;
            return card.petImageList[0]?.imageURL;
        }else if (card.fashionImageList && card.fashionImageList[0]?.imageURL) {
            this.imagesList = card.fashionImageList;
            return card.fashionImageList[0]?.imageURL;
        }else if (card.bookImageList && card.bookImageList[0]?.imageURL) {
            this.imagesList = card.bookImageList;
            return card.bookImageList[0]?.imageURL;
        }else if (card.propertyImageList && card.propertyImageList[0]?.imageURL) {
            this.imagesList = card.propertyImageList;
            return card.propertyImageList[0]?.imageURL;
        }else if (card.jobImageList && card.jobImageList[0]?.imageURL) {
            this.imagesList = card.jobImageList;
            return card.jobImageList[0]?.imageURL;
        }else if (card.commercialServiceImagesList && card.commercialServiceImagesList[0]?.imageURL) {
            this.imagesList = card.commercialServiceImagesList;
            return card.commercialServiceImagesList[0]?.imageURL;
        }
        else {
            return '../../../assets/image_not_available.jpg';
        }
    }
    setMainCategoryName(cards: any) {
        for (var i = 0; i < cards.length; i++) {
            for (var j = 0; j < this.mainCategories.length; j++) {
                if (cards[i].categoryId == this.mainCategories[j].id) {
                    cards[i].mainCategory = this.mainCategories[j].categoryName;
                    cards[i].isFeatured = i === 0;
                    break;
                }
            }
        }
    }
    getSalaryPeriod(id: number) {
        let selectedSalaryPeriod = this.salaryPeriods.filter(salaryPeriod => Number(salaryPeriod.id) == id);
        if (selectedSalaryPeriod.length > 0)
            return selectedSalaryPeriod[0].label;
        return "";
    }

    stateAbbreviation(stateName: string): string {
      switch (stateName) {
        case "Andhra Pradesh":
          return 'AP';
        case "Arunachal Pradesh":
          return 'AR';
        case "Assam":
          return 'AS';
        case "Bihar":
          return 'BR';
        case "Chhattisgarh":
          return 'CG';
        case "Goa":
          return 'GA';
        case "Gujarat":
          return 'GJ';
        case "Haryana":
          return 'HR';
        case "Himachal Pradesh":
          return 'HP';
        case "Jammu and Kashmir":
          return 'JK';
        case "Jharkhand":
          return 'JH';
        case "Karnataka":
          return 'KA';
        case "Kerala":
          return 'KL';
        case "Madhya Pradesh":
          return 'MP';
        case "Maharashtra":
          return 'MH';
        case "Manipur":
          return 'MN';
        case "Meghalaya":
          return 'ML';
        case "Mizoram":
          return 'MZ';
        case "Nagaland":
          return 'NL';
        case "Orissa":
          return 'OR';
        case "Punjab":
          return 'PB';
        case "Rajasthan":
          return 'RJ';
        case "Sikkim":
          return 'SK';
        case "Tamil Nadu":
          return 'TN';
        case "Tripura":
          return 'TR';
        case "Uttarakhand":
          return 'UK';
        case "Uttar Pradesh":
          return 'UP';
        case "West Bengal":
          return 'WB';
        case "Andaman and Nicobar Islands":
          return 'AN';
        case "Chandigarh":
          return 'CH';
        case "Dadra and Nagar Haveli":
          return 'DH';
        case "Daman and Diu":
          return 'DD';
        case "Delhi":
          return 'DL';
        case "Lakshadweep":
          return 'LD';
        case "Pondicherry":
          return 'PY';
        default:
          return stateName;
      }
    }
    
    
}

// AddFavorite() {

//   const reportPayload = {
//     id: 0,
//     productId: this.productId,
//     categoryId: this.categoryId,
//     createdBy: localStorage.getItem('id'),
//     createdOn: new Date().toISOString(),
//   };

//   console.log('Request Payload:', reportPayload);

//   this.UserService.AdReportByUser(reportPayload).subscribe(
//     (response: any) => {
//       // console.log('Report sent successfully:', response);
//       console.log('API Response:', response);

//     },
//     (error: any) => {
//       // Handle error response, if needed
//       console.error('Error sending report:', error);
//     }
//   );
// }
