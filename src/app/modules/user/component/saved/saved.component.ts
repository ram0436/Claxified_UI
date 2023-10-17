import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { CommonService } from 'src/app/shared/service/common.service';
import * as moment from 'moment';
import { SalaryPeriod } from '../../../../shared/enum/SalaryPeriod';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent {

  savedCards: any[] = [];
  imagesList: any = [];
  currentDate: Date = new Date();
  isScrolledDown = false;
  isLoading: Boolean = true;
  salaryPeriods = Object.keys(SalaryPeriod).map((key: any) => ({
    label: key,
    id: SalaryPeriod[key],
  }));

  constructor(private UserService: UserService, private router: Router, private CommonService: CommonService) { }

  ngOnInit() {
    this.UserService.GetWishlistByUserId(Number(localStorage.getItem("id"))).subscribe(
      (response: any) => {
        response.forEach((item: any) => {
          const tabRefGuid = item.productId;
          const categoryId = item.categoryId; 
          this.handleDashboardData(categoryId, tabRefGuid);
        });
      },
      (error: any) => {
        console.error('API Error:', error);
      }
    );
  }

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

  handleDashboardData(categoryId: number, tabRefGuid: string) {
    this.CommonService.getDashboardItemByGuid(categoryId, tabRefGuid).subscribe(
      (dashboardResponse: any) => {
        if (Array.isArray(dashboardResponse)) {
          // Push each item from the API response to the savedCards array
          this.savedCards.push(...dashboardResponse);
          this.isLoading = false;
        } else if (typeof dashboardResponse === 'object' && dashboardResponse !== null) {
          // If the response is an object, push it to the savedCards array
          this.savedCards.push(dashboardResponse);
          this.isLoading = false;
        } else {
          // console.error('Invalid API response:', dashboardResponse);
        }
      },
      (dashboardError: any) => {
        // console.error('Dashboard API Error:', dashboardError);
        this.savedCards = []; // Set savedCards to an empty array in case of an error
        this.isLoading = false;
      }
    );
  }

  getMainCategory(currentCategoryId: number): string {
    if (currentCategoryId === 1) {
      return 'Gadgets';
    } else if (currentCategoryId === 2) {
      return 'Vehicles';
    }else if (currentCategoryId === 3) {
      return 'Properties';
    }else if (currentCategoryId === 4) {
      return 'Jobs';
    }else if (currentCategoryId === 5) {
      return 'Electronics & Appliances';
    }else if (currentCategoryId === 6) {
      return 'Furniture';
    }else if (currentCategoryId === 7) {
      return 'Books';
    }else if (currentCategoryId === 8) {
      return 'Sports & Hobbies';
    }else if (currentCategoryId === 9) {
      return 'Pets';
    } else if (currentCategoryId === 10) {
      return 'Fashion';
    }  else if (currentCategoryId === 11) {
      return 'Commercial Services';
    }  else {
      return '';
    }
  }

  formatPrice(price: number): string {
    const roundedPrice = Math.round(price);
  
    const formattedPrice = roundedPrice.toLocaleString('en-IN');
  
    return formattedPrice;
  }

  truncateTitle(title: string, maxLength: number = 32): string {
    if (!title) {
        return ''; // Return an empty string for null or undefined titles
    }
    
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
    }else if (card.commercialServiceImageList && card.commercialServiceImageList[0]?.imageURL) {
        this.imagesList = card.commercialServiceImageList;
        return card.commercialServiceImageList[0]?.imageURL;
    }
    else {
        return '../../../assets/image_not_available.jpg';
    }
}

}
