export class BusinessWorkingHours {
  id: number = 0;
  businessId: number = 0;
  dayOfWeek: number = 0; // 0 = Sunday ... 6 = Saturday
  openTime: string = "";
  closeTime: string = "";
  isClosed: boolean = true;
}

export class BusinessContact {
  id: number = 0;
  businessId: number = 0;
  contactPerson: string = "";
  mobile: string = "";
  alternateMobile: string = "";
  email: string = "";
  whatsApp: string = "";
}

export class BusinessSocialMedia {
  id: number = 0;
  businessId: number = 0;
  facebook: string = "";
  instagram: string = "";
  linkedIn: string = "";
  youTube: string = "";
  twitter: string = "";
}

export class BusinessAddress {
  id: number = 0;
  businessId: number = 0;
  country: string = "";
  state: string = "";
  city: string = "";
  area: string = "";
  pincode: string = "";
  address: string = "";
  isPrimary: boolean = true;
  googleMapURL: string = "";
}

export class BusinessGallery {
  id: number = 0;
  businessId: number = 0;
  imageUrl: string = "";
  thumbnailUrl: string = "";
  caption: string = "";
  displayOrder: number = 0;
}

export class BusinessVerification {
  id: number = 0;
  businessId: number = 0;
  isGSTVerified: number = 0;
  isPANVerified: number = 0;
  isAadhaarVerified: number = 0;
  isEmailVerified: number = 0;
  isMobileVerified: number = 0;
  isBusinessVerified: boolean = false;
  verificationDate: string | null = null;
  verifiedBy: number = 0;
  verificationRemarks: string = "";
}

export class Business {
  createdBy: number = 0;
  createdOn: string | null = null;
  modifiedBy: number = 0;
  modifiedOn: string | null = null;
  isDeleted: boolean = false;
  deletedDate: string | null = null;
  deletedBy: number = 0;

  id: number = 0;
  tabRefGUID: string = "";
  userId: number = 0;
  businessName: string = "";
  businessCategoryId: number | null = null;
  businessSubCategoryId: number | null = null;
  businessTypeId: number | null = null;
  sellerTypeId: number | null = null;
  description: string = "";
  logoUrl: string = "";
  coverImageUrl: string = "";
  establishedYear: number | null = null;
  website: string = "";
  status: number = 1;
  businessWorkingHoursList: BusinessWorkingHours[] = [];
  businessVerification: BusinessVerification = new BusinessVerification();
  businessContact: BusinessContact = new BusinessContact();
  businessSocialMedia: BusinessSocialMedia = new BusinessSocialMedia();
  businessAddress: BusinessAddress = new BusinessAddress();
  businessGalleryList: BusinessGallery[] = [];
}
