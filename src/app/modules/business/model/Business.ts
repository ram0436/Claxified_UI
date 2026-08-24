import { EntityType } from "../enum/business-product.enum";

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
  userId: number;
  businessName: string;
  businessCategory: string;
  businessSubCategory: string;
  businessCategoryId: number;
  businessSubCategoryId: number;
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

export interface BusinessDirectoryVerification {
  id: number;
  businessId: number;
  isGSTVerified: number;
  isPANVerified: number;
  isAadhaarVerified: number;
  isEmailVerified: number;
  isMobileVerified: number;
  isBusinessVerified: boolean;
  verificationDate: string;
  verificationRemarks: string;
  verifiedBy: number;
}

export interface BusinessDirectoryContact {
  id: number;
  businessId: number;
  contactPerson: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  whatsApp: string;
}

export interface BusinessDirectoryAddress {
  id: number;
  businessId: number;
  country: string;
  state: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  isPrimary: boolean;
  googleMapURL: string;
}

export interface BusinessDirectorySocialMedia {
  id: number;
  businessId: number;
  facebook: string;
  instagram: string;
  linkedIn: string;
  youTube: string;
  twitter: string;
}

export interface BusinessDirectoryWorkingHours {
  id: number;
  businessId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface BusinessDirectoryGallery {
  id: number;
  businessId: number;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  displayOrder: number;
}

export interface BusinessDirectoryItem {
  id: number;
  userId: number;
  businessName: string;
  businessCategoryId: number;
  businessCategory: string;
  businessSubCategoryId: number;
  businessSubCategory: string;
  businessTypeId: number;
  businessType: string;
  sellerTypeId: number;
  sellerType: string;
  tabRefGUID: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  establishedYear: number;
  website: string;
  status: number;
  businessVerificationDto?: BusinessDirectoryVerification;
  businessContactDto?: BusinessDirectoryContact;
  businessAddressDto?: BusinessDirectoryAddress;
  businessSocialMediaDto?: BusinessDirectorySocialMedia;
  businessWorkingHoursDtoList?: BusinessDirectoryWorkingHours[];
  businessGalleryDtoList?: BusinessDirectoryGallery[];
}

export class BusinessProductAttribute {
  id: number = 0;
  businessProductId: number = 0;
  productSubCategoryAttributeId: number = 0;
  value: string = "";
}

export class BusinessProductImage {
  id: number = 0;
  businessProductId: number = 0;
  imageUrl: string = "";
  isPrimary: boolean = true;
  sortOrder: number = 0;
}

export class BusinessProduct {
  id: number = 0;
  businessId: number = 0;
  name: string = "";
  productCategoryId: number = 0;
  productSubCategoryId: number = 0;
  shortDescription: string = "";
  about: string = "";
  price: number = 0;
  discountPercentage: number = 0;
  priceOnRequest: boolean = true;
  gst: number = 0;
  priceUnit: number = 1;
  condition: number = 1;
  availabilityStatus: number = 1;
  deliveryAvailable: boolean = true;
  shippingCharges: number = 0;
  freeShipping: boolean = true;
  warrantyAvailable: boolean = true;
  warrantyDuration: number = 0;
  warrantyPeriodUnit: number = 1;
  warrantyDescription: string = "";
  returnPolicy: string = "";
  attributes: BusinessProductAttribute[] = [];
  images: BusinessProductImage[] = [];
}

export interface BusinessProductImageDto {
  id?: number;
  businessProductId?: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface BusinessProductAttributeViewDto {
  name: string;
  value: string;
}

export interface BusinessProductAttributeDto {
  id?: number;
  businessProductId?: number;
  productAttributeMasterId: number;
  value: string;
}

export interface BusinessProductDto {
  id: number;
  businessId: number;
  name: string;
  productCategoryId: number;
  productSubCategoryId: number;
  shortDescription: string;
  about: string;
  price: number;
  discountPercentage: number;
  priceOnRequest: "Yes" | "No";
  gst: number;
  priceUnit: string; // e.g. "Piece"
  condition: string; // e.g. "New"
  availabilityStatus: string; // e.g. "InStock"
  deliveryAvailable: "Yes" | "No";
  shippingCharges: number;
  freeShipping: "Yes" | "No";
  warrantyAvailable: "Yes" | "No";
  warrantyDuration: number;
  warrantyPeriodUnit: string; // e.g. "Month"
  warrantyDescription: string;
  returnPolicy: string;
  attributes: BusinessProductAttributeViewDto[];
  images: BusinessProductImageDto[];
}

export interface ProductCategoryDto {
  id: number;
  name: string;
}

export interface ProductSubCategoryDto {
  id: number;
  productCategoryId: number;
  name: string;
}

export interface ProductSubCategoryAttributeDto {
  id: number;
  productSubCategoryId: number;
  name: string; // attribute label, e.g. "Brand", "Warranty Support"
}

// ---------- Product attribute master lookups (internal, not user-facing) ----------

export interface ProductAttributeMasterDto {
  productAttributeMasterId: number;
  name: string;
  dataType: string; // "string" | "number" | etc.
  unit: string | null;
}

// =====================================================================
// ---------------------------- OFFERS --------------------------------
// =====================================================================

/** Used for creating/updating an offer (POST Business/offer) */
export class BusinessOffer {
  id: number = 0;
  businessId: number = 0;
  title: string = "";
  description: string = "";
  offerType: number = 1;
  discountValue: number = 0;
  couponCode: string = "";
  minimumPurchaseAmount: number = 0;
  maximumDiscountAmount: number = 0;
  startDate: string = new Date().toISOString();
  endDate: string = new Date().toISOString();
  usageLimit: number = 0;
  usagePerUser: number = 0;
  termsAndConditions: string = "";
  isFeatured: boolean = true;
  isActive: boolean = true;
  createdDate: string = new Date().toISOString();
}

/** Response shape for GET Business/offers?businessId= */
export interface BusinessOfferDto {
  id: number;
  businessId: number;
  title: string;
  description: string;
  offerType: number;
  discountValue: number;
  couponCode: string;
  minimumPurchaseAmount: number;
  maximumDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usagePerUser: number;
  termsAndConditions: string;
  isFeatured: boolean;
  isActive: boolean;
  createdDate: string;
}

// =====================================================================
// ---------------------------- REVIEWS -------------------------------
// =====================================================================

/** Used for creating/updating a review (POST Business/review) */
export class BusinessReview {
  id: number = 0;
  businessId: number = 0;
  userId: number = 0;
  rating: number = 0;
  title: string = "";
  comment: string = "";
  isVerified: boolean = true;
  businessReply: string = "";
  businessReplyDate: string = new Date().toISOString();
  isPublished: boolean = true;
  createdDate: string = new Date().toISOString();
  updatedDate: string = new Date().toISOString();
}

/** Response shape for GET Business/reviews?businessId= */
export interface BusinessReviewDto {
  id: number;
  businessId: number;
  userId: number;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  businessReply: string;
  businessReplyDate: string;
  isPublished: boolean;
  createdDate: string;
  updatedDate: string;
}

// =====================================================================
// ---------------------------- SERVICES ------------------------------
// =====================================================================

export enum ServicePricingType {
  FixedPrice = 1,
  StartingFrom = 2,
  PriceRange = 3,
  Hourly = 4,
  Daily = 5,
  CustomQuote = 6,
}

export enum ServiceMode {
  AtBusiness = 1,
  AtCustomerLocation = 2,
  Remote = 3,
}

export enum ServiceAvailabilityStatus {
  Available = 1,
  TemporarilyUnavailable = 2,
  NotAvailable = 3,
}

export enum ServiceDurationUnit {
  Minute = 1,
  Hour = 2,
  Day = 3,
  Week = 4,
  Month = 5,
}

export const SERVICE_PRICING_TYPE_OPTIONS: {
  value: ServicePricingType;
  label: string;
}[] = [
  { value: ServicePricingType.FixedPrice, label: "Fixed Price" },
  { value: ServicePricingType.StartingFrom, label: "Starting From" },
  { value: ServicePricingType.PriceRange, label: "Price Range" },
  { value: ServicePricingType.Hourly, label: "Hourly" },
  { value: ServicePricingType.Daily, label: "Daily" },
  { value: ServicePricingType.CustomQuote, label: "Custom Quote" },
];

export const SERVICE_MODE_OPTIONS: { value: ServiceMode; label: string }[] = [
  { value: ServiceMode.AtBusiness, label: "At Business" },
  { value: ServiceMode.AtCustomerLocation, label: "At Customer Location" },
  { value: ServiceMode.Remote, label: "Remote" },
];

export const SERVICE_AVAILABILITY_STATUS_OPTIONS: {
  value: ServiceAvailabilityStatus;
  label: string;
}[] = [
  { value: ServiceAvailabilityStatus.Available, label: "Available" },
  {
    value: ServiceAvailabilityStatus.TemporarilyUnavailable,
    label: "Temporarily Unavailable",
  },
  { value: ServiceAvailabilityStatus.NotAvailable, label: "Not Available" },
];

export const SERVICE_DURATION_UNIT_OPTIONS: {
  value: ServiceDurationUnit;
  label: string;
}[] = [
  { value: ServiceDurationUnit.Minute, label: "Minute(s)" },
  { value: ServiceDurationUnit.Hour, label: "Hour(s)" },
  { value: ServiceDurationUnit.Day, label: "Day(s)" },
  { value: ServiceDurationUnit.Week, label: "Week(s)" },
  { value: ServiceDurationUnit.Month, label: "Month(s)" },
];

export class BusinessServiceAttribute {
  id: number = 0;
  businessServiceId: number = 0;
  serviceAttributeMasterId: number = 0;
  value: string = "";
}

export class BusinessServiceImage {
  id: number = 0;
  businessServiceId: number = 0;
  imageUrl: string = "";
  isPrimary: boolean = true;
  sortOrder: number = 0;
}

/** Used for creating/updating a service (POST Business/service) */
export class BusinessServicePayload {
  id: number = 0;
  businessId: number = 0;
  serviceCategoryId: number = 0;
  serviceSubCategoryId: number = 0;
  serviceName: string = "";
  shortDescription: string = "";
  about: string = "";
  minimumPrice: number = 0;
  maximumPrice: number = 0;
  pricingType: ServicePricingType = ServicePricingType.FixedPrice;
  gstIncluded: boolean = true;
  serviceMode: ServiceMode = ServiceMode.AtBusiness;
  serviceArea: string = "";
  duration: number = 0;
  durationUnit: ServiceDurationUnit = ServiceDurationUnit.Hour;
  isBookingRequired: boolean = true;
  availability: ServiceAvailabilityStatus = ServiceAvailabilityStatus.Available;
  isActive: boolean = true;
  attributes: BusinessServiceAttribute[] = [];
  images: BusinessServiceImage[] = [];
}

export interface BusinessServiceAttributeViewDto {
  name: string;
  value: string;
}

export interface BusinessServiceImageDto {
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

/** Response shape for GET Business/services?businessId= and GET Business/services/{id} */
export interface BusinessServiceDto {
  id: number;
  businessId: number;
  serviceCategoryId: number;
  serviceSubCategoryId: number;
  serviceName: string;
  shortDescription: string;
  about: string;
  minimumPrice: number;
  maximumPrice: number;
  pricingType: string; // e.g. "StartingFrom"
  gstIncluded: string; // "Yes" | "No"
  serviceMode: string; // e.g. "AtCustomerLocation"
  serviceArea: string;
  duration: number;
  durationUnit: string; // e.g. "Hour"
  isBookingRequired: string; // "Yes" | "No"
  availabilityStatus: string; // e.g. "Available"
  isActive: boolean;
  attributes: BusinessServiceAttributeViewDto[];
  images: BusinessServiceImageDto[];
}

export interface ServiceAttributeMasterDto {
  serviceAttributeMasterId: number;
  name: string;
  dataType: string; // "string" | "number" | etc.
  unit: string | null;
}

export interface ServiceAttributeMasterIdsDto {
  serviceAttributeMasterIds: number[];
}

export interface ServiceAttributeMasterDto {
  serviceAttributeMasterId: number;
  name: string;
  dataType: string; // "string" | "number" | etc.
  unit: string | null;
}

export interface ServiceAttributeDetailDto {
  serviceAttributeMasterId: number;
  name: string;
  dataType: string;
  unit: string | null;
}

export interface CatalogItem {
  id: number;
  type: "product" | "service";
  name: string;
  category?: string;
  price: number;
  discountPercentage: number;
  priceOnRequest: boolean;
  priceUnit: string;
  imageUrl: string;
  minimumPrice?: number;
  maximumPrice?: number;
  pricingType?: string;
  pricingTypeDisplay?: string;
}

/** Response shape for GET Business/attribute-masterids?businessSubCategoryId= */
export interface AttributeMasterIdDto {
  attributeMasterId: number;
  entityType: EntityType;
  isActive: boolean;
}

/** Response shape for GET Business/attributes-detail?attributeMasterIds=... */
export interface AttributeMasterDto {
  attributeMasterId: number;
  name: string;
  dataType: string; // "string" | "number" | "boolean" etc.
  unit: string | null;
}

export interface AttributeMasterListItem {
  id: number;
  name: string;
}

export interface CategoryAttributeMappingPayload {
  subCategoryId: number;
  attributeMasterIds: number[];
  entityType: number;
}

export interface CategoryAttributeMappingDto {
  subCategoryId: number;
  entityType: number;
  attributeMasterIds: number[];
}
