export class AuditFields {
  createdBy: number = 0;
  createdOn: string = new Date().toISOString().slice(0, 23);
  modifiedBy: number = 0;
  modifiedOn: string = new Date().toISOString().slice(0, 23);
  isDeleted: boolean = false;
  deletedDate: string = new Date().toISOString().slice(0, 23);
  deletedBy: number = 0;
}

export class BusinessWorkingHours extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  dayOfWeek: number = 0;
  openTime: string = "";
  closeTime: string = "";
  isClosed: boolean = true;
}

export class BusinessContact extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  contactPerson: string = "";
  mobile: string = "";
  alternateMobile: string = "";
  email: string = "";
  whatsApp: string = "";
}

export class BusinessSocialMedia extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  facebook: string = "";
  instagram: string = "";
  linkedIn: string = "";
  youTube: string = "";
  twitter: string = "";
}

export class BusinessAddress extends AuditFields {
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

export class BusinessGallery extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  imageUrl: string = "";
  thumbnailUrl: string = "";
  caption: string = "";
  displayOrder: number = 0;
}

export class BusinessVerification extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  isGSTVerified: number = 0;
  isPANVerified: number = 0;
  isAadhaarVerified: number = 0;
  isEmailVerified: number = 0;
  isMobileVerified: number = 0;
  isBusinessVerified: boolean = false;
  verificationDate: string = new Date().toISOString().slice(0, 23);
  verifiedBy: number = 0;
  verificationRemarks: string = "";
}

export class Business extends AuditFields {
  id: number = 0;
  tabRefGUID: string = "";
  userId: number = 0;
  businessName: string = "";
  businessCategoryId: number = 0;
  businessSubCategoryId: number = 0;
  businessTypeId: number = 0;
  sellerTypeId: number = 0;
  description: string = "";
  logoUrl: string = "";
  coverImageUrl: string = "";
  establishedYear: number = 0;
  website: string = "";
  status: number = 1;
  businessWorkingHoursList: BusinessWorkingHours[] = [];
  businessVerification: BusinessVerification = new BusinessVerification();
  businessContact: BusinessContact = new BusinessContact();
  businessSocialMedia: BusinessSocialMedia = new BusinessSocialMedia();
  businessAddress: BusinessAddress = new BusinessAddress();
  businessGalleryList: BusinessGallery[] = [];
}
