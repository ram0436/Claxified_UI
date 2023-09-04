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
    currentDate: Date = new Date();

    // Pagination properties
    // pageSize = 20;
    currentPage = 0;
    totalPages = 0;
    paginatedCards: any[] = [];
    mainCategories: any = [];
    mainCategory: any;
    imageIndex: number = 0;
    imagesList: any = [1];
    
    displayedCardCount: number = 20;

    isScrolledDown = false;

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
        if (card.gadgetImageList && card.gadgetImageList[0]?.imageURL) {
            return card.gadgetImageList[0]?.imageURL;
        } else if (card.vehicleImageList && card.vehicleImageList[0]?.imageURL) {
            return card.vehicleImageList[0]?.imageURL;
        } else if (card.electronicApplianceImageList && card.electronicApplianceImageList[0]?.imageURL) {
            return card.electronicApplianceImageList[0]?.imageURL;
        } else if (card.furnitureImageList && card.furnitureImageList[0]?.imageURL) {
            return card.furnitureImageList[0]?.imageURL;
        }else if (card.sportImageList && card.sportImageList[0]?.imageURL) {
            return card.sportImageList[0]?.imageURL;
        }else if (card.petImageList && card.petImageList[0]?.imageURL) {
            return card.petImageList[0]?.imageURL;
        }else if (card.fashionImageList && card.fashionImageList[0]?.imageURL) {
            return card.fashionImageList[0]?.imageURL;
        }else if (card.bookImageList && card.bookImageList[0]?.imageURL) {
            return card.bookImageList[0]?.imageURL;
        }else if (card.propertyImageList && card.propertyImageList[0]?.imageURL) {
            return card.propertyImageList[0]?.imageURL;
        }else if (card.jobImageList && card.jobImageList[0]?.imageURL) {
            return card.jobImageList[0]?.imageURL;
        }else if (card.commercialServiceImagesList && card.commercialServiceImagesList[0]?.imageURL) {
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
}
