import { Injectable } from '@angular/core';

/**
 * Small client-side helper shared across the "My Claxified" account area.
 * Resolves category display names, thumbnail images and status labels
 * from the raw ad objects returned by `CommonService.getAllAdsByUserId`.
 * Kept separate from CommonService/UserService because it does not talk
 * to the API - it only shapes data those services already return.
 */
@Injectable({
  providedIn: 'root',
})
export class ClaxifiedHelperService {
  private readonly categoryModuleMap: { [key: string]: string } = {
    Gadgets: 'Classified Ads',
    Vehicles: 'Classified Ads',
    Books: 'Classified Ads',
    'Commercial Services': 'Classified Ads',
    Properties: 'Marketplace',
    Jobs: 'Classified Ads',
    'Electronics & Appliances': 'Classified Ads',
    Furniture: 'Marketplace',
    'Sports & Hobbies': 'Classified Ads',
    Pets: 'Classified Ads',
    Fashion: 'Classified Ads',
  };

  getModuleForCategory(categoryName: string): string {
    return this.categoryModuleMap[categoryName] || 'Classified Ads';
  }

  getCategoryName(ad: any, mainCategories: any[]): string {
    const category = mainCategories.find((c: any) => c.id === ad.categoryId);
    return category ? category.categoryName : 'Uncategorized';
  }

  getEntityKey(categoryName: string): string {
    switch (categoryName) {
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

  getCardImageURL(card: any): string {
    const imageLists = [
      'gadgetImageList',
      'vehicleImageList',
      'electronicApplianceImageList',
      'furnitureImageList',
      'sportImageList',
      'petImageList',
      'fashionImageList',
      'bookImageList',
      'propertyImageList',
      'jobImageList',
      'commercialServiceImagesList',
    ];
    for (const key of imageLists) {
      if (card[key] && card[key][0]?.imageURL) {
        return card[key][0].imageURL;
      }
    }
    return '../../../../../assets/image_not_available.jpg';
  }

  getStatusLabel(ad: any): 'Active' | 'Pending Approval' | 'Inactive' {
    if (ad.isVerified === false) {
      return 'Pending Approval';
    }
    return ad.isActive ? 'Active' : 'Inactive';
  }

  getAdTitle(ad: any): string {
    return (
      ad.title ||
      ad.name ||
      ad.adTitle ||
      ad.propertyTitle ||
      ad.jobTitle ||
      `Listing #${ad.id}`
    );
  }

  getAdLocation(ad: any): string {
    const parts = [ad.cityName || ad.city, ad.stateName || ad.state].filter(
      Boolean,
    );
    return parts.length ? parts.join(', ') : '—';
  }
}
