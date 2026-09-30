import { OfferingType } from '../enum/business-offering.enum';
import { OFFERING_FIELD_OPTIONS } from './Business';

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'textarea'
  | 'select'
  | 'checkbox';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  rows?: number;
  def?: any;
}

export type LayoutBlock =
  | { kind: 'row'; fields: FieldDef[] }
  | { kind: 'full'; field: FieldDef }
  | { kind: 'checks'; fields: FieldDef[] };

export interface GenericDetailConfig {
  /** Name of the FormGroup property on the component */
  formName: string;
  fields: FieldDef[];
}

/** Fields sent as "yyyy-MM-ddT00:00:00Z" (or 23:59:59Z for deadlines) */
export const DATE_FIELDS = [
  'startDate',
  'endDate',
  'eventDate',
  'eventEndDate',
  'registrationDeadline',
  'possessionDate',
  'departureDate',
  'returnDate',
  'bookingDeadline',
];
export const END_OF_DAY_FIELDS = ['registrationDeadline', 'bookingDeadline'];
/** Fields sent as "HH:mm:ss" */
export const TIME_FIELDS = [
  'startTime',
  'endTime',
  'checkInTime',
  'checkOutTime',
];

export function defaultFor(f: FieldDef): any {
  if (f.def !== undefined) return f.def;
  switch (f.type) {
    case 'number':
      return 0;
    case 'checkbox':
      return false;
    case 'date':
      return null;
    default:
      return '';
  }
}

/** Groups fields into rows of 2, full-width textareas, and checkbox blocks */
export function buildLayout(fields: FieldDef[]): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  let row: FieldDef[] = [];
  let checks: FieldDef[] = [];
  const flushRow = () => {
    if (row.length) {
      blocks.push({ kind: 'row', fields: row });
      row = [];
    }
  };
  const flushChecks = () => {
    if (checks.length) {
      blocks.push({ kind: 'checks', fields: checks });
      checks = [];
    }
  };

  for (const f of fields) {
    if (f.type === 'checkbox') {
      flushRow();
      checks.push(f);
      continue;
    }
    flushChecks();
    if (f.type === 'textarea') {
      flushRow();
      blocks.push({ kind: 'full', field: f });
      continue;
    }
    row.push(f);
    if (row.length === 2) flushRow();
  }
  flushRow();
  flushChecks();
  return blocks;
}

// ---- tiny builders ----
const T = (key: string, label: string, def?: any): FieldDef => ({
  key,
  label,
  type: 'text',
  def,
});
const N = (key: string, label: string, def?: any): FieldDef => ({
  key,
  label,
  type: 'number',
  def,
});
const D = (key: string, label: string): FieldDef => ({
  key,
  label,
  type: 'date',
});
const TM = (key: string, label: string): FieldDef => ({
  key,
  label,
  type: 'time',
});
const TA = (key: string, label: string, rows = 2): FieldDef => ({
  key,
  label,
  type: 'textarea',
  rows,
});
const S = (
  key: string,
  label: string,
  options: readonly string[],
  def?: any,
): FieldDef => ({ key, label, type: 'select', options, def });
const C = (key: string, label: string, def = false): FieldDef => ({
  key,
  label,
  type: 'checkbox',
  def,
});

const O = OFFERING_FIELD_OPTIONS;
const CURRENCY = ['INR', 'USD', 'EUR', 'AED', 'GBP'];

export const DETAIL_CONFIG: Partial<Record<number, GenericDetailConfig>> = {
  // ---------------- Menu item ----------------
  [OfferingType.MenuItem]: {
    formName: 'menuItemForm',
    fields: [
      T('itemName', 'Item Name'),
      S('itemCategory', 'Item Category', O.menuItem.itemCategory),
      S('cuisine', 'Cuisine', O.menuItem.cuisine),
      S('foodType', 'Food Type', O.menuItem.foodType),
      S('mealType', 'Meal Type', O.menuItem.mealType),
      S('spiceLevel', 'Spice Level', O.menuItem.spiceLevel),
      T('portionSize', 'Portion Size'),
      S('servingSize', 'Serving Size', O.menuItem.servingSize),
      T('serves', 'Serves'),
      N('price', 'Price (₹)'),
      N('discountPrice', 'Discount Price (₹)'),
      S('currency', 'Currency', CURRENCY, 'INR'),
      N('calories', 'Calories'),
      N('preparationTime', 'Preparation Time'),
      S(
        'preparationTimeUnit',
        'Prep Time Unit',
        O.menuItem.preparationTimeUnit,
      ),
      N('packagingCharge', 'Packaging Charge (₹)'),
      TA('description', 'Description'),
      TA('ingredients', 'Ingredients'),
      C('vegetarian', 'Vegetarian'),
      C('vegan', 'Vegan'),
      C('eggless', 'Eggless'),
      C('jain', 'Jain'),
      C('halal', 'Halal'),
      C('glutenFree', 'Gluten Free'),
      C('sugarFree', 'Sugar Free'),
      C('containsNuts', 'Contains Nuts'),
      C('chefSpecial', "Chef's Special"),
      C('bestseller', 'Bestseller'),
      C('dineInAvailable', 'Dine-in Available'),
      C('takeawayAvailable', 'Takeaway Available'),
      C('deliveryAvailable', 'Delivery Available'),
    ],
  },

  // ---------------- Room / Accommodation ----------------
  [OfferingType.RoomAccommodation]: {
    formName: 'accommodationForm',
    fields: [
      T('propertyName', 'Property Name'),
      S(
        'accommodationType',
        'Accommodation Type',
        O.accommodation.accommodationType,
      ),
      S('roomType', 'Room Type', O.accommodation.roomType),
      T('roomName', 'Room Name'),
      N('roomSize', 'Room Size'),
      S('roomSizeUnit', 'Room Size Unit', O.accommodation.roomSizeUnit),
      S('bedType', 'Bed Type', O.accommodation.bedType),
      N('numberOfBeds', 'Number of Beds'),
      N('maxGuests', 'Max Guests'),
      N('numberOfRooms', 'Number of Rooms'),
      S('bathroomType', 'Bathroom Type', O.accommodation.bathroomType),
      TM('checkInTime', 'Check-in Time'),
      TM('checkOutTime', 'Check-out Time'),
      N('minimumStayNights', 'Minimum Stay (nights)'),
      N('maximumStayNights', 'Maximum Stay (nights)'),
      N('pricePerNight', 'Price / Night (₹)'),
      N('pricePerPerson', 'Price / Person (₹)'),
      N('extraGuestCharge', 'Extra Guest Charge (₹)'),
      N('securityDeposit', 'Security Deposit (₹)'),
      TA('cancellationPolicy', 'Cancellation Policy'),
      C('availability', 'Available', true),
      C('mealIncluded', 'Meal Included'),
      C('breakfastIncluded', 'Breakfast Included'),
      C('airConditioned', 'Air Conditioned'),
      C('wiFi', 'Wi-Fi'),
      C('tv', 'TV'),
      C('parking', 'Parking'),
      C('roomService', 'Room Service'),
      C('housekeeping', 'Housekeeping'),
      C('laundry', 'Laundry'),
      C('restaurantAvailable', 'Restaurant Available'),
      C('swimmingPool', 'Swimming Pool'),
      C('gym', 'Gym'),
      C('petFriendly', 'Pet Friendly'),
      C('smokingAllowed', 'Smoking Allowed'),
      C('coupleFriendly', 'Couple Friendly'),
      C('familyFriendly', 'Family Friendly'),
    ],
  },

  // ---------------- Property ----------------
  [OfferingType.Property]: {
    formName: 'propertyForm',
    fields: [
      T('propertyName', 'Property Name'),
      S('propertyType', 'Property Type', O.property.propertyType),
      S('listingType', 'Listing Type', O.property.listingType),
      S('transactionType', 'Transaction Type', O.property.transactionType),
      S('propertyStatus', 'Property Status', O.property.propertyStatus),
      T('bhk', 'BHK'),
      N('bedrooms', 'Bedrooms'),
      N('bathrooms', 'Bathrooms'),
      N('balconies', 'Balconies'),
      N('area', 'Area'),
      S('areaUnit', 'Area Unit', O.property.areaUnit),
      N('carpetArea', 'Carpet Area'),
      N('builtUpArea', 'Built-up Area'),
      N('plotArea', 'Plot Area'),
      N('floorNumber', 'Floor Number'),
      N('totalFloors', 'Total Floors'),
      S('facing', 'Facing', O.property.facing),
      N('ageOfProperty', 'Age of Property (years)'),
      D('possessionDate', 'Possession Date'),
      N('price', 'Price (₹)'),
      S('currency', 'Currency', CURRENCY, 'INR'),
      N('pricePerSqFt', 'Price / Sq Ft (₹)'),
      N('maintenanceCharge', 'Maintenance Charge (₹)'),
      N('securityDeposit', 'Security Deposit (₹)'),
      S('furnishedStatus', 'Furnished Status', O.property.furnishedStatus),
      N('roadWidth', 'Road Width'),
      S('roadWidthUnit', 'Road Width Unit', O.property.roadWidthUnit),
      S('ownershipType', 'Ownership Type', O.property.ownershipType),
      T('reraNumber', 'RERA Number'),
      TA('amenities', 'Amenities'),
      TA('nearbyLandmarks', 'Nearby Landmarks'),
      C('parking', 'Parking'),
      C('coveredParking', 'Covered Parking'),
      C('openParking', 'Open Parking'),
      C('lift', 'Lift'),
      C('powerBackup', 'Power Backup'),
      C('waterSupply', 'Water Supply'),
      C('security', 'Security'),
      C('gatedCommunity', 'Gated Community'),
      C('reraApproved', 'RERA Approved'),
      C('loanAvailable', 'Loan Available'),
      C('negotiable', 'Price Negotiable'),
    ],
  },

  // ---------------- Rental vehicle ----------------
  [OfferingType.RentalVehicle]: {
    formName: 'rentalVehicleForm',
    fields: [
      T('vehicleName', 'Vehicle Name'),
      S('vehicleType', 'Vehicle Type', O.rentalVehicle.vehicleType),
      S('vehicleCategory', 'Vehicle Category', O.rentalVehicle.vehicleCategory),
      S('brand', 'Brand', O.rentalVehicle.brand),
      T('model', 'Model'),
      T('variant', 'Variant'),
      N('manufacturingYear', 'Manufacturing Year'),
      N('registrationYear', 'Registration Year'),
      S('fuelType', 'Fuel Type', O.rentalVehicle.fuelType),
      S('transmission', 'Transmission', O.rentalVehicle.transmission),
      N('seatingCapacity', 'Seating Capacity'),
      N('numberOfDoors', 'Number of Doors'),
      N('engineCapacity', 'Engine Capacity (cc)'),
      S(
        'vehicleCondition',
        'Vehicle Condition',
        O.rentalVehicle.vehicleCondition,
      ),
      S('rentalType', 'Rental Type', O.rentalVehicle.rentalType),
      N('rentalDuration', 'Rental Duration'),
      S(
        'rentalDurationUnit',
        'Rental Duration Unit',
        O.rentalVehicle.durationUnit,
      ),
      N('pricePerHour', 'Price / Hour (₹)'),
      N('pricePerDay', 'Price / Day (₹)'),
      N('pricePerWeek', 'Price / Week (₹)'),
      N('pricePerMonth', 'Price / Month (₹)'),
      S('currency', 'Currency', CURRENCY, 'INR'),
      N('securityDeposit', 'Security Deposit (₹)'),
      N('minimumRentalDuration', 'Minimum Rental Duration'),
      S(
        'minimumRentalDurationUnit',
        'Min Duration Unit',
        O.rentalVehicle.durationUnit,
      ),
      N('maximumRentalDuration', 'Maximum Rental Duration'),
      S(
        'maximumRentalDurationUnit',
        'Max Duration Unit',
        O.rentalVehicle.durationUnit,
      ),
      N('kmLimit', 'KM Limit'),
      N('extraKMCharge', 'Extra KM Charge (₹)'),
      N('driverCharge', 'Driver Charge (₹)'),
      T('pickupLocation', 'Pickup Location'),
      T('dropLocation', 'Drop Location'),
      N('ageRequirement', 'Minimum Driver Age'),
      TA('documentsRequired', 'Documents Required'),
      C('availability', 'Available', true),
      C('fuelIncluded', 'Fuel Included'),
      C('driverIncluded', 'Driver Included'),
      C('pickupAndDropAvailable', 'Pickup & Drop Available'),
      C('insuranceIncluded', 'Insurance Included'),
      C('depositRequired', 'Deposit Required'),
    ],
  },

  // ---------------- Event ----------------
  [OfferingType.Event]: {
    formName: 'eventForm',
    fields: [
      T('eventName', 'Event Name'),
      S('eventType', 'Event Type', O.event.eventType),
      S('eventCategory', 'Event Category', O.event.eventCategory),
      D('eventDate', 'Event Date'),
      D('eventEndDate', 'Event End Date'),
      TM('startTime', 'Start Time'),
      TM('endTime', 'End Time'),
      T('venueName', 'Venue Name'),
      S('venueType', 'Venue Type', O.event.venueType),
      T('venueAddress', 'Venue Address'),
      T('city', 'City'),
      N('capacity', 'Capacity'),
      T('organizerName', 'Organizer Name'),
      T('contactPerson', 'Contact Person'),
      N('ticketPrice', 'Ticket Price (₹)'),
      N('earlyBirdPrice', 'Early Bird Price (₹)'),
      S('currency', 'Currency', CURRENCY, 'INR'),
      D('registrationDeadline', 'Registration Deadline'),
      N('ageLimit', 'Age Limit'),
      T('audienceType', 'Audience Type'),
      T('language', 'Language'),
      T('registrationURL', 'Registration URL'),
      TA('eventHighlights', 'Event Highlights'),
      TA('speakers', 'Speakers'),
      TA('performers', 'Performers'),
      TA('activities', 'Activities'),
      TA('cancellationPolicy', 'Cancellation Policy'),
      C('ticketRequired', 'Ticket Required'),
      C('registrationRequired', 'Registration Required'),
      C('foodIncluded', 'Food Included'),
      C('parkingAvailable', 'Parking Available'),
      C('accommodationAvailable', 'Accommodation Available'),
      C('onlineEvent', 'Online Event'),
      C('offlineEvent', 'Offline Event'),
    ],
  },

  // ---------------- Tour package ----------------
  [OfferingType.TourPackage]: {
    formName: 'tourPackageForm',
    fields: [
      T('packageName', 'Package Name'),
      S('packageType', 'Package Type', O.tourPackage.packageType),
      T('destination', 'Destination'),
      T('origin', 'Origin'),
      N('duration', 'Duration'),
      S('durationUnit', 'Duration Unit', O.tourPackage.durationUnit),
      N('numberOfDays', 'Number of Days'),
      N('numberOfNights', 'Number of Nights'),
      S('travelMode', 'Travel Mode', O.tourPackage.travelMode),
      D('departureDate', 'Departure Date'),
      D('returnDate', 'Return Date'),
      N('groupSize', 'Group Size'),
      N('minimumGroupSize', 'Minimum Group Size'),
      N('maximumGroupSize', 'Maximum Group Size'),
      N('pricePerPerson', 'Price / Person (₹)'),
      N('childPrice', 'Child Price (₹)'),
      N('infantPrice', 'Infant Price (₹)'),
      N('singleOccupancyPrice', 'Single Occupancy Price (₹)'),
      S('currency', 'Currency', CURRENCY, 'INR'),
      S('hotelCategory', 'Hotel Category', O.tourPackage.hotelCategory),
      S('roomType', 'Room Type', O.tourPackage.roomType),
      D('bookingDeadline', 'Booking Deadline'),
      T('destinationsCovered', 'Destinations Covered'),
      T('placesCovered', 'Places Covered'),
      TA('itinerary', 'Itinerary', 4),
      TA('packageHighlights', 'Package Highlights'),
      TA('exclusions', 'Exclusions'),
      TA('cancellationPolicy', 'Cancellation Policy'),
      C('mealsIncluded', 'Meals Included'),
      C('breakfastIncluded', 'Breakfast Included'),
      C('lunchIncluded', 'Lunch Included'),
      C('dinnerIncluded', 'Dinner Included'),
      C('transportIncluded', 'Transport Included'),
      C('airportTransfer', 'Airport Transfer'),
      C('localTransport', 'Local Transport'),
      C('sightseeingIncluded', 'Sightseeing Included'),
      C('activitiesIncluded', 'Activities Included'),
      C('guideIncluded', 'Guide Included'),
      C('entranceFeesIncluded', 'Entrance Fees Included'),
      C('travelInsurance', 'Travel Insurance'),
      C('visaAssistance', 'Visa Assistance'),
    ],
  },

  // ---------------- Membership ----------------
  [OfferingType.MembershipPlan]: {
    formName: 'membershipPlanForm',
    fields: [
      T('planName', 'Plan Name'),
      S('planType', 'Plan Type', O.membership.planType),
      S('fitnessCategory', 'Fitness Category', O.membership.fitnessCategory),
      S('membershipType', 'Membership Type', O.membership.membershipType),
      N('duration', 'Duration'),
      S('durationUnit', 'Duration Unit', O.membership.durationUnit),
      N('price', 'Price (₹)'),
      S('currency', 'Currency', CURRENCY, 'INR'),
      N('joiningFee', 'Joining Fee (₹)'),
      N('renewalFee', 'Renewal Fee (₹)'),
      N('discount', 'Discount (%)'),
      N('numberOfSessions', 'Number of Sessions'),
      T('trainerName', 'Trainer Name'),
      T('classTypes', 'Class Types'),
      S('fitnessLevel', 'Fitness Level', O.membership.fitnessLevel),
      T('ageGroup', 'Age Group'),
      S('gender', 'Gender', O.membership.gender),
      S('accessType', 'Access Type', O.membership.accessType),
      T('availableDays', 'Available Days'),
      T('availableTime', 'Available Time'),
      N('trialDuration', 'Trial Duration'),
      S(
        'trialDurationUnit',
        'Trial Duration Unit',
        O.membership.trialDurationUnit,
      ),
      TA('classSchedule', 'Class Schedule'),
      TA('cancellationPolicy', 'Cancellation Policy'),
      C('personalTrainingIncluded', 'Personal Training Included'),
      C('groupClassesIncluded', 'Group Classes Included'),
      C('trainerIncluded', 'Trainer Included'),
      C('gymAccess', 'Gym Access'),
      C('equipmentAccess', 'Equipment Access'),
      C('lockerFacility', 'Locker Facility'),
      C('showerFacility', 'Shower Facility'),
      C('saunaAvailable', 'Sauna Available'),
      C('steamRoomAvailable', 'Steam Room Available'),
      C('swimmingPool', 'Swimming Pool'),
      C('dietConsultation', 'Diet Consultation'),
      C('nutritionPlan', 'Nutrition Plan'),
      C('onlineTraining', 'Online Training'),
      C('homeTraining', 'Home Training'),
      C('trialAvailable', 'Trial Available'),
      C('freeTrial', 'Free Trial'),
      C('membershipTransferable', 'Membership Transferable'),
    ],
  },
};
