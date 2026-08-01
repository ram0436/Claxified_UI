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

/** Used for creating/updating a business (POST /api/Business) */
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

// ---------- Registration payload (users + business combined) ----------

export class BusinessRegisterUser {
  mobileNo: string = "";
  otp: number = 0;
  name: string = "";
}

export class BusinessRegisterRequest {
  users: BusinessRegisterUser = new BusinessRegisterUser();
  business: Business = new Business();
}

// ---------- "My Businesses" list (GET /Business/businesses?userId=) ----------

export interface BusinessListItem {
  businessId: string;
  businessName: string;
  logoUrl: string;
}

export interface BusinessVerificationDto {
  id: number;
  isGSTVerified: number;
  isPANVerified: number;
  isAadhaarVerified: number;
  isEmailVerified: number;
  isMobileVerified: number;
  isBusinessVerified: number | boolean;
  verificationDate: string;
  verificationRemarks: string;
}

export interface BusinessContactDto {
  id: number;
  contactPerson: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  whatsApp: string;
}

export interface BusinessAddressDto {
  id: number;
  country: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  isPrimary: boolean;
  googleMapURL: string;
}

export interface BusinessSocialMediaDto {
  id: number;
  facebook: string;
  instagram: string;
  linkedIn: string;
  youTube: string;
  twitter: string;
}

export interface BusinessWorkingHoursDto {
  id: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface BusinessGalleryDto {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  displayOrder: number;
}

export interface BusinessViewDto {
  id: number;
  businessName: string;
  businessCategory: string;
  businessSubCategory: string;
  businessType: string;
  sellerType: string;
  tabRefGUID: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  establishedYear: number;
  website: string;
  status: number;
  businessVerificationDto?: BusinessVerificationDto;
  businessContactDto?: BusinessContactDto;
  businessAddressDto?: BusinessAddressDto;
  businessSocialMediaDto?: BusinessSocialMediaDto;
  businessWorkingHoursDtoList?: BusinessWorkingHoursDto[];
  businessGalleryDtoList?: BusinessGalleryDto[];
}
