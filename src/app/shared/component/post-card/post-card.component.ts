import { Component, Input, OnInit, HostListener } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from '../../service/common.service';
import { SalaryPeriod } from '../../enum/SalaryPeriod';

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
  
    constructor(private router: Router, private commonService: CommonService) { }

    ngOnInit() {
        this.paginatedCards = this.cards.slice(0, this.displayedCardCount);
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

toggleFavorite(event: Event) {
  event.preventDefault(); 
  event.stopPropagation();
  this.isFavorite = !this.isFavorite;
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
            return '../../../assets/image_not_available.png';
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


    // stateAbbreviation(stateName: string){
    //     switch (stateName) {
    //       case "Andhra Pradesh":
    //         this.stateAbr = 'AP';
    //         break;
    //       case "Arunachal Pradesh":
    //         this.stateAbr = 'AR';
    //         break;
    //       case "Assam":
    //         this.stateAbr = 'AS';
    //         break;
    //       case "Bihar":
    //         this.stateAbr = 'BR';
    //         break;
    //       case "Chhattisgarh":
    //         this.stateAbr = 'CG';
    //         break;
    //       case "Goa":
    //         this.stateAbr = 'GA';
    //         break;
    //       case "Gujarat":
    //         this.stateAbr = 'GJ';
    //         break;
    //       case "Haryana":
    //         this.stateAbr = 'HR';
    //         break;
    //       case "Himachal Pradesh":
    //         this.stateAbr = 'HP';
    //         break;
    //       case "Jammu and Kashmir":
    //         this.stateAbr = 'JK';
    //         break;
    //       case "Jharkhand":
    //         this.stateAbr = 'JH';
    //         break;
    //       case "Karnataka":
    //         this.stateAbr = 'KA';
    //         break;
    //       case "Kerala":
    //         this.stateAbr = 'KL';
    //         break;
    //       case "Madhya Pradesh":
    //         this.stateAbr = 'MP';
    //         break;
    //       case "Maharashtra":
    //         this.stateAbr = 'MH';
    //         break;
    //       case "Manipur":
    //         this.stateAbr = 'MN';
    //         break;
    //       case "Meghalaya":
    //         this.stateAbr = 'ML';
    //         break;
    //       case "Mizoram":
    //         this.stateAbr = 'MZ';
    //         break;
    //       case "Nagaland":
    //         this.stateAbr = 'NL';
    //         break;
    //       case "Orissa":
    //         this.stateAbr = 'OR';
    //         break;
    //       case "Punjab":
    //         this.stateAbr = 'PB';
    //         break;
    //       case "Rajasthan":
    //         this.stateAbr = 'RJ';
    //         break;
    //       case "Sikkim":
    //         this.stateAbr = 'SK';
    //         break;
    //       case "Tamil Nadu":
    //         this.stateAbr = 'TN';
    //         break;
    //       case "Tripura":
    //         this.stateAbr = 'TR';
    //         break;
    //       case "Uttarakhand":
    //         this.stateAbr = 'UK';
    //         break;
    //       case "Uttar Pradesh":
    //         this.stateAbr = 'UP';
    //         break;
    //       case "West Bengal":
    //         this.stateAbr = 'WB';
    //         break;
    //       case "Tamil Nadu":
    //         this.stateAbr = 'TN';
    //         break;
    //       case "Tripura":
    //         this.stateAbr = 'TR';
    //         break;
    //       case "Andaman and Nicobar Islands":
    //         this.stateAbr = 'AN';
    //         break;
    //       case "Chandigarh":
    //         this.stateAbr = 'CH';
    //         break;
    //       case "Dadra and Nagar Haveli":
    //         this.stateAbr = 'DH';
    //         break;
    //       case "Daman and Diu":
    //         this.stateAbr = 'DD';
    //         break;
    //       case "Delhi":
    //         this.stateAbr = 'DL';
    //         break;
    //       case "Lakshadweep":
    //         this.stateAbr = 'LD';
    //         break;
    //       case "Pondicherry":
    //         this.stateAbr = 'PY';
    //         break;
    //     }
    //   }

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
