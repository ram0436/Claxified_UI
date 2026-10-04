import { OfferingType } from '../enum/business-offering.enum';
import { EntityType } from '../enum/business-product.enum';

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
  openTime: string = '';
  closeTime: string = '';
  isClosed: boolean = true;
}

export class BusinessContact extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  contactPerson: string = '';
  mobile: string = '';
  alternateMobile: string = '';
  email: string = '';
  whatsApp: string = '';
}

export class BusinessSocialMedia extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  facebook: string = '';
  instagram: string = '';
  linkedIn: string = '';
  youTube: string = '';
  twitter: string = '';
}

export class BusinessAddress extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  country: string = '';
  state: string = '';
  city: string = '';
  area: string = '';
  pincode: string = '';
  address: string = '';
  isPrimary: boolean = true;
  googleMapURL: string = '';
}

export class BusinessGallery extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  imageUrl: string = '';
  thumbnailUrl: string = '';
  caption: string = '';
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
  verificationRemarks: string = '';
}

export class BusinessSubCategoryMapping extends AuditFields {
  id: number = 0;
  businessId: number = 0;
  businessSubCategoryId: number = 0;
  businessCategoryId: number = 0;
}

/** Used for creating/updating a business (POST /api/Business) */
export class Business extends AuditFields {
  id: number = 0;
  tabRefGUID: string = '';
  userId: number = 0;
  businessName: string = '';
  businessCategoryId: number = 0;
  businessTypeId: number = 0;
  sellerTypeId: number = 0;
  description: string = '';
  logoUrl: string = '';
  coverImageUrl: string = '';
  establishedYear: number = 0;
  website: string = '';
  status: number = 1;
  businessWorkingHoursList: BusinessWorkingHours[] = [];
  businessVerification: BusinessVerification = new BusinessVerification();
  businessContact: BusinessContact = new BusinessContact();
  businessSocialMedia: BusinessSocialMedia = new BusinessSocialMedia();
  businessAddress: BusinessAddress = new BusinessAddress();
  businessGalleryList: BusinessGallery[] = [];
  businessSubCategoryMappings: BusinessSubCategoryMapping[] = [];
}

// ---------- Registration payload (users + business combined) ----------

export class BusinessRegisterUser {
  mobileNo: string = '';
  otp: number = 0;
  name: string = '';
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
  city?: string;
  area?: string;
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

/** Response / Edit shape for GET Business/{id} and PUT Business/{id} */
export interface BusinessViewDto {
  id: number;
  userId: number;
  businessName: string;
  businessCategory: string;
  businessCategoryId: number;
  businessSubCategoryIds: number[];
  businessSubCategory: string[];
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

/** Response shape for the business directory / list endpoints */
export interface BusinessDirectoryItem {
  id: number;
  userId: number;
  businessName: string;
  businessCategoryId: number;
  businessCategory: string;
  businessSubCategoryIds: number[];
  businessSubCategory: string[];
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
  value: string = '';
}

export class BusinessProductImage {
  id: number = 0;
  businessProductId: number = 0;
  imageUrl: string = '';
  isPrimary: boolean = true;
  sortOrder: number = 0;
}

export class BusinessProduct {
  id: number = 0;
  businessId: number = 0;
  name: string = '';
  productCategoryId: number = 0;
  productSubCategoryId: number = 0;
  shortDescription: string = '';
  about: string = '';
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
  warrantyDescription: string = '';
  returnPolicy: string = '';
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
  productAttributeMasterId: number;
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
  priceOnRequest: 'Yes' | 'No';
  gst: number;
  priceUnit: string; // e.g. "Piece"
  condition: string; // e.g. "New"
  availabilityStatus: string; // e.g. "InStock"
  deliveryAvailable: 'Yes' | 'No';
  shippingCharges: number;
  freeShipping: 'Yes' | 'No';
  warrantyAvailable: 'Yes' | 'No';
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
  title: string = '';
  description: string = '';
  offerType: number = 1;
  discountValue: number = 0;
  couponCode: string = '';
  minimumPurchaseAmount: number = 0;
  maximumDiscountAmount: number = 0;
  startDate: string = new Date().toISOString();
  endDate: string = new Date().toISOString();
  usageLimit: number = 0;
  usagePerUser: number = 0;
  termsAndConditions: string = '';
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
  title: string = '';
  comment: string = '';
  isVerified: boolean = true;
  businessReply: string = '';
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
  { value: ServicePricingType.FixedPrice, label: 'Fixed Price' },
  { value: ServicePricingType.StartingFrom, label: 'Starting From' },
  { value: ServicePricingType.PriceRange, label: 'Price Range' },
  { value: ServicePricingType.Hourly, label: 'Hourly' },
  { value: ServicePricingType.Daily, label: 'Daily' },
  { value: ServicePricingType.CustomQuote, label: 'Custom Quote' },
];

export const SERVICE_MODE_OPTIONS: { value: ServiceMode; label: string }[] = [
  { value: ServiceMode.AtBusiness, label: 'At Business' },
  { value: ServiceMode.AtCustomerLocation, label: 'At Customer Location' },
  { value: ServiceMode.Remote, label: 'Remote' },
];

export const SERVICE_AVAILABILITY_STATUS_OPTIONS: {
  value: ServiceAvailabilityStatus;
  label: string;
}[] = [
  { value: ServiceAvailabilityStatus.Available, label: 'Available' },
  {
    value: ServiceAvailabilityStatus.TemporarilyUnavailable,
    label: 'Temporarily Unavailable',
  },
  { value: ServiceAvailabilityStatus.NotAvailable, label: 'Not Available' },
];

export const SERVICE_DURATION_UNIT_OPTIONS: {
  value: ServiceDurationUnit;
  label: string;
}[] = [
  { value: ServiceDurationUnit.Minute, label: 'Minute(s)' },
  { value: ServiceDurationUnit.Hour, label: 'Hour(s)' },
  { value: ServiceDurationUnit.Day, label: 'Day(s)' },
  { value: ServiceDurationUnit.Week, label: 'Week(s)' },
  { value: ServiceDurationUnit.Month, label: 'Month(s)' },
];

export class BusinessServiceAttribute {
  id: number = 0;
  businessServiceId: number = 0;
  serviceAttributeMasterId: number = 0;
  value: string = '';
}

export class BusinessServiceImage {
  id: number = 0;
  businessServiceId: number = 0;
  imageUrl: string = '';
  isPrimary: boolean = true;
  sortOrder: number = 0;
}

/** Used for creating/updating a service (POST Business/service) */
export class BusinessServicePayload {
  id: number = 0;
  businessId: number = 0;
  serviceCategoryId: number = 0;
  serviceSubCategoryId: number = 0;
  serviceName: string = '';
  shortDescription: string = '';
  about: string = '';
  minimumPrice: number = 0;
  maximumPrice: number = 0;
  pricingType: ServicePricingType = ServicePricingType.FixedPrice;
  gstIncluded: boolean = true;
  serviceMode: ServiceMode = ServiceMode.AtBusiness;
  serviceArea: string = '';
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

export interface ServiceAttributeDetailDto {
  serviceAttributeMasterId: number;
  name: string;
  dataType: string;
  unit: string | null;
}

export interface CatalogItem {
  id: number;
  type: 'product' | 'service';
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
  subCategoryId: number;
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

export interface OfferingTypeOptionDto {
  value: number;
  name: string;
}

export const OFFERING_TYPE_OPTIONS: { value: OfferingType; label: string }[] = [
  { value: OfferingType.Product, label: 'Product' },
  { value: OfferingType.Service, label: 'Service' },
  { value: OfferingType.Course, label: 'Course' },
  { value: OfferingType.MedicalService, label: 'Medical Service' },
  { value: OfferingType.RoomAccommodation, label: 'Room / Accommodation' },
  { value: OfferingType.MenuItem, label: 'Menu Item' },
  { value: OfferingType.Property, label: 'Property' },
  { value: OfferingType.RentalVehicle, label: 'Rental Vehicle' },
  { value: OfferingType.Event, label: 'Event' },
  { value: OfferingType.TourPackage, label: 'Tour Package' },
  { value: OfferingType.MembershipPlan, label: 'Membership / Plan' },
];

export const SUPPORTED_OFFERING_TYPES: OfferingType[] = [
  OfferingType.Course,
  OfferingType.MedicalService,
  OfferingType.MenuItem,
  OfferingType.RoomAccommodation,
  OfferingType.Property,
  OfferingType.RentalVehicle,
  OfferingType.Event,
  OfferingType.TourPackage,
  OfferingType.MembershipPlan,
];

export const OFFERING_FIELD_OPTIONS = {
  course: {
    courseType: [
      'Certificate',
      'Diploma',
      'Degree',
      'Workshop',
      'Bootcamp',
      'Short Term',
      'Long Term',
    ],
    courseCategory: [
      'Technology',
      'Business',
      'Arts',
      'Science',
      'Language',
      'Music',
      'Sports',
      'Test Preparation',
    ],
    courseLevel: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    modeOfLearning: ['Online', 'Offline', 'Hybrid', 'Self-paced'],
    durationUnit: ['Hours', 'Days', 'Weeks', 'Months', 'Years'],
    classSchedule: [
      'Weekdays',
      'Weekends',
      'Mon-Wed-Fri',
      'Tue-Thu',
      'Daily',
      'Flexible',
    ],
    eligibility: [
      'No prerequisite',
      '10th Pass',
      '12th Pass',
      'Graduate',
      'Post Graduate',
    ],
    ageGroup: ['Kids (5-12)', 'Teens (13-17)', 'Adults (18+)', 'All Ages'],
    language: ['English', 'Hindi', 'Urdu', 'Punjabi', 'Bilingual'],
    certification: [
      'Completion Certificate',
      'Government Certified',
      'Industry Certified',
      'None',
    ],
    feeFrequency: ['One-time', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly'],
  },
  medical: {
    serviceType: [
      'Consultation',
      'Diagnostic',
      'Surgery',
      'Therapy',
      'Vaccination',
      'Health Checkup',
    ],
    medicalSpecialty: [
      'General Physician',
      'Cardiology',
      'Dermatology',
      'Dentistry',
      'Orthopedics',
      'Pediatrics',
      'Gynecology',
      'ENT',
      'Ophthalmology',
      'Neurology',
      'Psychiatry',
    ],
    department: [
      'OPD',
      'IPD',
      'Emergency',
      'Radiology',
      'Pathology',
      'Physiotherapy',
    ],
    gender: ['Male', 'Female', 'Any'],
    serviceMode: ['In-clinic', 'Home Visit', 'Online', 'Hospital'],
    consultationType: [
      'First Visit',
      'Follow-up',
      'Second Opinion',
      'Emergency',
    ],
    serviceDurationUnit: ['Minutes', 'Hours', 'Days'],
    availableDays: ['Mon-Fri', 'Mon-Sat', 'Everyday', 'Weekends only'],
    availableTime: ['9 AM - 1 PM', '9 AM - 5 PM', '5 PM - 9 PM', '24 Hours'],
    ageGroup: ['Children', 'Adults', 'Senior Citizens', 'All Ages'],
  },
  menuItem: {
    itemCategory: [
      'Starter',
      'Main Course',
      'Dessert',
      'Beverage',
      'Snack',
      'Bread',
      'Rice & Biryani',
      'Combo',
    ],
    cuisine: [
      'North Indian',
      'South Indian',
      'Chinese',
      'Italian',
      'Continental',
      'Fast Food',
      'Desserts',
      'Beverages',
      'Mughlai',
    ],
    foodType: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'],
    mealType: [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Lunch & Dinner',
      'Snacks',
      'All Day',
    ],
    spiceLevel: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
    preparationTimeUnit: ['Minutes', 'Hours'],
    servingSize: [
      '1 Person',
      '2 Persons',
      'Family (4)',
      'Half Plate',
      'Full Plate',
    ],
  },
  accommodation: {
    accommodationType: [
      'Hotel',
      'Resort',
      'Guest House',
      'Hostel',
      'Homestay',
      'Villa',
      'Apartment',
    ],
    roomType: [
      'Standard Room',
      'Deluxe Room',
      'Suite',
      'Family Room',
      'Dormitory',
      'Studio',
    ],
    roomSizeUnit: ['Sq Ft', 'Sq M'],
    bedType: ['Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 'Twin Beds'],
    bathroomType: ['Attached Bathroom', 'Shared Bathroom'],
  },
  property: {
    propertyType: [
      'Apartment',
      'Villa',
      'Independent House',
      'Plot',
      'Shop',
      'Office',
      'Warehouse',
    ],
    listingType: ['Residential', 'Commercial', 'Industrial', 'Agricultural'],
    transactionType: ['Sale', 'Rent', 'Lease'],
    propertyStatus: ['Ready to Move', 'Under Construction', 'Resale'],
    furnishedStatus: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    facing: [
      'North',
      'South',
      'East',
      'West',
      'North-East',
      'North-West',
      'South-East',
      'South-West',
    ],
    areaUnit: ['Sq Ft', 'Sq M', 'Sq Yd', 'Acre'],
    roadWidthUnit: ['Feet', 'Meters'],
    ownershipType: [
      'Freehold',
      'Leasehold',
      'Co-operative Society',
      'Power of Attorney',
    ],
  },
  rentalVehicle: {
    vehicleType: ['Car', 'Bike', 'Scooter', 'Bus', 'Van', 'Truck'],
    vehicleCategory: [
      'Hatchback',
      'Sedan',
      'SUV',
      'MUV',
      'Luxury',
      'Tempo Traveller',
    ],
    brand: [
      'Toyota',
      'Honda',
      'Suzuki',
      'Hyundai',
      'Kia',
      'Mahindra',
      'Tata',
      'Yamaha',
    ],
    fuelType: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    transmission: ['Manual', 'Automatic'],
    vehicleCondition: ['Excellent', 'Good', 'Fair'],
    rentalType: ['Hourly', 'Daily', 'Weekly', 'Monthly'],
    durationUnit: ['Hour', 'Day', 'Week', 'Month'],
  },
  event: {
    eventType: [
      'Concert',
      'Workshop',
      'Conference',
      'Exhibition',
      'Festival',
      'Sports',
      'Seminar',
      'Party',
    ],
    eventCategory: [
      'Technology',
      'Business',
      'Music',
      'Sports',
      'Education',
      'Arts & Culture',
      'Health',
      'Food',
    ],
    venueType: [
      'Convention Centre',
      'Banquet Hall',
      'Stadium',
      'Auditorium',
      'Outdoor',
      'Online',
    ],
  },
  tourPackage: {
    packageType: [
      'Domestic Holiday Package',
      'International Holiday Package',
      'Adventure',
      'Pilgrimage',
      'Honeymoon',
      'Family',
      'Corporate',
    ],
    durationUnit: ['Days', 'Nights', 'Weeks'],
    travelMode: ['Flight', 'Train', 'Bus', 'Car', 'Cruise'],
    hotelCategory: ['Budget', '3 Star', '4 Star', '5 Star', 'Luxury'],
    roomType: ['Standard Room', 'Deluxe Room', 'Suite', 'Family Room'],
  },
  membership: {
    planType: [
      'Monthly Membership',
      'Quarterly Membership',
      'Half-Yearly Membership',
      'Annual Membership',
    ],
    fitnessCategory: [
      'Gym & Fitness',
      'Yoga',
      'Swimming',
      'Sports Club',
      'Wellness & Spa',
      'Martial Arts',
    ],
    membershipType: [
      'Basic',
      'Standard',
      'Premium',
      'Family',
      'Student',
      'Corporate',
    ],
    durationUnit: ['Days', 'Months', 'Years'],
    fitnessLevel: [
      'Beginner',
      'Intermediate',
      'Advanced',
      'Beginner to Advanced',
    ],
    gender: ['All', 'Male', 'Female'],
    accessType: ['Full Access', 'Limited Access', 'Off-Peak Only'],
    trialDurationUnit: ['Days', 'Hours'],
  },
} as const;

export type OfferingFieldOptions = typeof OFFERING_FIELD_OPTIONS;

// ---------- Parent record ----------

export interface BusinessOfferingDto {
  id: number;
  businessId: number;
  subCategoryId: number;
  offeringType: OfferingType;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string | null;
}

// ---------- Combined save payload (all offering types) ----------

export interface OfferingCombinedSavePayload {
  businessOffering: BusinessOfferingDto;
  [detailKey: string]: any;
}

export interface OfferingDetailBase {
  id: number;
  businessOfferingId: number;
  businessId: number;
  [key: string]: any;
}
