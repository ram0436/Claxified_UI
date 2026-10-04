import { OfferingType } from '../enum/business-offering.enum';

export interface DetailRow {
  label: string;
  value: string;
}

export interface DetailFlag {
  label: string;
  icon: string;
}

export interface DetailText {
  title: string;
  value: string;
}

/** Everything the quick view / detail page needs to render a type-specific record. */
export interface OfferingDetailView {
  chips: string[];
  rows: DetailRow[];
  flags: DetailFlag[];
  texts: DetailText[];
}

export const EMPTY_DETAIL_VIEW: OfferingDetailView = {
  chips: [],
  rows: [],
  flags: [],
  texts: [],
};

/** Property name the backend wraps each detail under (same keys the add form uses). */
export const DETAIL_WRAPPER_KEY: Partial<Record<number, string>> = {
  [OfferingType.Course]: 'businessOfferingCourse',
  [OfferingType.MedicalService]: 'businessOfferingMedicalService',
  [OfferingType.MenuItem]: 'businessOfferingMenuItem',
  [OfferingType.RoomAccommodation]: 'businessOfferingAccommodation',
  [OfferingType.Property]: 'businessOfferingProperty',
  [OfferingType.RentalVehicle]: 'businessOfferingRentalVehicle',
  [OfferingType.Event]: 'businessOfferingEvent',
  [OfferingType.TourPackage]: 'businessOfferingTourPackage',
  [OfferingType.MembershipPlan]: 'businessOfferingMembershipPlan',
};

const TYPE_ICON: Partial<Record<number, string>> = {
  [OfferingType.Course]: 'school',
  [OfferingType.MedicalService]: 'medical_services',
  [OfferingType.MenuItem]: 'restaurant_menu',
  [OfferingType.RoomAccommodation]: 'hotel',
  [OfferingType.Property]: 'home_work',
  [OfferingType.RentalVehicle]: 'directions_car',
  [OfferingType.Event]: 'event',
  [OfferingType.TourPackage]: 'flight_takeoff',
  [OfferingType.MembershipPlan]: 'card_membership',
};

export function getOfferingIcon(type: OfferingType | number): string {
  return TYPE_ICON[Number(type)] || 'category';
}

/** Unwraps: array -> first item, { wrapperKey: {...} } -> inner, { anyKey: {...} } -> inner */
export function unwrapDetail(res: any, wrapperKey: string): any {
  let d = Array.isArray(res) ? res[0] : res;
  if (!d || typeof d !== 'object') return null;

  if (wrapperKey in d) {
    d = d[wrapperKey];
  } else if (!('businessOfferingId' in d) && !('id' in d)) {
    const keys = Object.keys(d);
    if (keys.length === 1 && typeof d[keys[0]] === 'object') {
      d = d[keys[0]];
    }
  }

  if (Array.isArray(d)) d = d[0];
  return d ?? null;
}

// ---------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------

/** Case-insensitive field reader for the detail record. */
type Getter = (key: string) => any;
type Fmt = (v: any, g: Getter) => string;
type RowDef = [string, string, Fmt?]; // label, key, formatter
type FlagDef = [string, string, string]; // key, label, icon
type TextDef = [string, string]; // key, title

interface TypeConfig {
  chips: string[];
  rows: RowDef[];
  flags: FlagDef[];
  texts: TextDef[];
}

const has = (v: any): boolean => {
  if (v === null || v === undefined || v === 0) return false;
  if (typeof v === 'object') return (v as any).ticks !== 0;
  return String(v).trim() !== '';
};

const plain: Fmt = (v) => String(v);
const suffix =
  (s: string): Fmt =>
  (v) =>
    `${v}${s}`;
const withUnit =
  (unitKey: string): Fmt =>
  (v, g) =>
    `${v} ${g(unitKey) || ''}`.trim();

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
};

const money: Fmt = (v, g) => {
  const sym =
    CURRENCY_SYMBOL[String(g('currency') || 'INR').toUpperCase()] ?? '₹';
  return `${sym}${Number(v).toLocaleString('en-IN')}`;
};

const rupee: Fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const date: Fmt = (v) => {
  const d = new Date(v);
  if (isNaN(d.getTime()) || d.getUTCFullYear() < 1900) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** Accepts "HH:mm[:ss]" or a .NET TimeSpan object. */
const time: Fmt = (v) => {
  let h: number;
  let m: number;
  if (typeof v === 'object' && v) {
    h = v.hours ?? 0;
    m = v.minutes ?? 0;
  } else {
    const x = /^(\d{1,2}):(\d{2})/.exec(String(v));
    if (!x) return String(v);
    h = +x[1];
    m = +x[2];
  }
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
};

// ---------------------------------------------------------------------
// Per-type configuration
// ---------------------------------------------------------------------

const TYPE_CONFIG: Partial<Record<number, TypeConfig>> = {
  [OfferingType.Course]: {
    chips: ['courseType', 'courseCategory', 'modeOfLearning'],
    rows: [
      ['Level', 'courseLevel'],
      ['Duration', 'duration', withUnit('durationUnit')],
      ['Class schedule', 'classSchedule'],
      ['Start date', 'startDate', date],
      ['End date', 'endDate', date],
      ['Eligibility', 'eligibility'],
      ['Age group', 'ageGroup'],
      ['Language', 'language'],
      ['Instructor', 'instructorName'],
      ['Institute', 'instituteName'],
      ['Certification', 'certification'],
      ['Accreditation', 'accreditation'],
      ['Batch size', 'batchSize'],
      ['Fee frequency', 'feeFrequency'],
      ['Registration fee', 'registrationFee', rupee],
      ['Discount', 'discount', suffix('%')],
    ],
    flags: [
      ['scholarshipAvailable', 'Scholarship', 'workspace_premium'],
      ['studyMaterialIncluded', 'Study material', 'menu_book'],
      ['examIncluded', 'Exam included', 'quiz'],
      ['placementAssistance', 'Placement assistance', 'work'],
      ['internshipAvailable', 'Internship', 'badge'],
    ],
    texts: [
      ['curriculum', 'Curriculum'],
      ['subjectsCovered', 'Subjects covered'],
      ['courseHighlights', 'Course highlights'],
    ],
  },

  [OfferingType.MedicalService]: {
    chips: ['serviceType', 'medicalSpecialty', 'serviceMode'],
    rows: [
      ['Specialty', 'medicalSpecialty'],
      ['Department', 'department'],
      ['Doctor', 'doctorName'],
      ['Qualification', 'qualification'],
      ['Experience', 'experience', suffix(' years')],
      ['Gender', 'gender'],
      ['Consultation type', 'consultationType'],
      ['Follow-up fee', 'followUpFee', rupee],
      ['Service duration', 'serviceDuration', withUnit('serviceDurationUnit')],
      ['Available days', 'availableDays'],
      ['Available time', 'availableTime'],
      ['Age group', 'ageGroup'],
    ],
    flags: [
      ['appointmentRequired', 'Appointment required', 'event_available'],
      ['emergencyService', 'Emergency service', 'emergency'],
      ['homeVisitAvailable', 'Home visit', 'home'],
      ['teleconsultationAvailable', 'Teleconsultation', 'videocam'],
      ['insuranceAccepted', 'Insurance accepted', 'health_and_safety'],
      ['cashlessAvailable', 'Cashless', 'credit_score'],
      ['labFacility', 'Lab facility', 'biotech'],
      ['pharmacyAvailable', 'Pharmacy', 'local_pharmacy'],
      ['ambulanceAvailable', 'Ambulance', 'airport_shuttle'],
    ],
    texts: [
      ['conditionsTreated', 'Conditions treated'],
      ['procedures', 'Procedures'],
      ['serviceHighlights', 'Service highlights'],
    ],
  },

  [OfferingType.MenuItem]: {
    chips: ['itemCategory', 'cuisine', 'foodType'],
    rows: [
      ['Item', 'itemName'],
      ['Meal type', 'mealType'],
      ['Spice level', 'spiceLevel'],
      ['Portion size', 'portionSize'],
      ['Serving size', 'servingSize'],
      ['Serves', 'serves'],
      ['Price', 'price', money],
      ['Discount price', 'discountPrice', money],
      ['Calories', 'calories', suffix(' kcal')],
      ['Preparation time', 'preparationTime', withUnit('preparationTimeUnit')],
      ['Packaging charge', 'packagingCharge', money],
    ],
    flags: [
      ['vegetarian', 'Vegetarian', 'eco'],
      ['vegan', 'Vegan', 'spa'],
      ['eggless', 'Eggless', 'block'],
      ['jain', 'Jain', 'self_improvement'],
      ['halal', 'Halal', 'verified'],
      ['glutenFree', 'Gluten free', 'grain'],
      ['sugarFree', 'Sugar free', 'block'],
      ['containsNuts', 'Contains nuts', 'warning'],
      ['chefSpecial', "Chef's special", 'star'],
      ['bestseller', 'Bestseller', 'local_fire_department'],
      ['dineInAvailable', 'Dine-in', 'restaurant'],
      ['takeawayAvailable', 'Takeaway', 'takeout_dining'],
      ['deliveryAvailable', 'Delivery', 'delivery_dining'],
    ],
    texts: [
      ['description', 'About this dish'],
      ['ingredients', 'Ingredients'],
    ],
  },

  [OfferingType.RoomAccommodation]: {
    chips: ['accommodationType', 'roomType', 'bedType'],
    rows: [
      ['Property', 'propertyName'],
      ['Room', 'roomName'],
      ['Room size', 'roomSize', withUnit('roomSizeUnit')],
      ['Beds', 'numberOfBeds'],
      ['Max guests', 'maxGuests'],
      ['Rooms', 'numberOfRooms'],
      ['Bathroom', 'bathroomType'],
      ['Check-in', 'checkInTime', time],
      ['Check-out', 'checkOutTime', time],
      ['Minimum stay', 'minimumStayNights', suffix(' nights')],
      ['Maximum stay', 'maximumStayNights', suffix(' nights')],
      ['Price per night', 'pricePerNight', rupee],
      ['Price per person', 'pricePerPerson', rupee],
      ['Extra guest charge', 'extraGuestCharge', rupee],
      ['Security deposit', 'securityDeposit', rupee],
    ],
    flags: [
      ['availability', 'Available', 'check_circle'],
      ['mealIncluded', 'Meals included', 'restaurant'],
      ['breakfastIncluded', 'Breakfast included', 'free_breakfast'],
      ['airConditioned', 'Air conditioned', 'ac_unit'],
      ['wiFi', 'Wi-Fi', 'wifi'],
      ['tv', 'TV', 'tv'],
      ['parking', 'Parking', 'local_parking'],
      ['roomService', 'Room service', 'room_service'],
      ['housekeeping', 'Housekeeping', 'cleaning_services'],
      ['laundry', 'Laundry', 'local_laundry_service'],
      ['restaurantAvailable', 'Restaurant', 'restaurant_menu'],
      ['swimmingPool', 'Swimming pool', 'pool'],
      ['gym', 'Gym', 'fitness_center'],
      ['petFriendly', 'Pet friendly', 'pets'],
      ['smokingAllowed', 'Smoking allowed', 'smoking_rooms'],
      ['coupleFriendly', 'Couple friendly', 'favorite'],
      ['familyFriendly', 'Family friendly', 'people'],
    ],
    texts: [['cancellationPolicy', 'Cancellation policy']],
  },

  [OfferingType.Property]: {
    chips: ['propertyType', 'listingType', 'transactionType'],
    rows: [
      ['Property', 'propertyName'],
      ['Status', 'propertyStatus'],
      ['BHK', 'bhk'],
      ['Bedrooms', 'bedrooms'],
      ['Bathrooms', 'bathrooms'],
      ['Balconies', 'balconies'],
      ['Area', 'area', withUnit('areaUnit')],
      ['Carpet area', 'carpetArea', withUnit('areaUnit')],
      ['Built-up area', 'builtUpArea', withUnit('areaUnit')],
      ['Plot area', 'plotArea', withUnit('areaUnit')],
      [
        'Floor',
        'floorNumber',
        (v, g) =>
          has(g('totalFloors')) ? `${v} of ${g('totalFloors')}` : String(v),
      ],
      ['Facing', 'facing'],
      ['Age of property', 'ageOfProperty', suffix(' years')],
      ['Possession date', 'possessionDate', date],
      ['Price', 'price', money],
      ['Price per sq ft', 'pricePerSqFt', money],
      ['Maintenance', 'maintenanceCharge', money],
      ['Security deposit', 'securityDeposit', money],
      ['Furnishing', 'furnishedStatus'],
      ['Road width', 'roadWidth', withUnit('roadWidthUnit')],
      ['Ownership', 'ownershipType'],
      ['RERA number', 'reraNumber'],
    ],
    flags: [
      ['parking', 'Parking', 'local_parking'],
      ['coveredParking', 'Covered parking', 'garage'],
      ['openParking', 'Open parking', 'directions_car'],
      ['lift', 'Lift', 'elevator'],
      ['powerBackup', 'Power backup', 'battery_charging_full'],
      ['waterSupply', 'Water supply', 'water_drop'],
      ['security', 'Security', 'security'],
      ['gatedCommunity', 'Gated community', 'home'],
      ['reraApproved', 'RERA approved', 'verified'],
      ['loanAvailable', 'Loan available', 'account_balance'],
      ['negotiable', 'Price negotiable', 'sell'],
    ],
    texts: [
      ['amenities', 'Amenities'],
      ['nearbyLandmarks', 'Nearby landmarks'],
    ],
  },

  [OfferingType.RentalVehicle]: {
    chips: ['vehicleType', 'vehicleCategory', 'transmission'],
    rows: [
      ['Vehicle', 'vehicleName'],
      ['Brand', 'brand'],
      ['Model', 'model'],
      ['Variant', 'variant'],
      ['Manufacturing year', 'manufacturingYear'],
      ['Registration year', 'registrationYear'],
      ['Fuel', 'fuelType'],
      ['Seats', 'seatingCapacity'],
      ['Doors', 'numberOfDoors'],
      ['Engine', 'engineCapacity', suffix(' cc')],
      ['Condition', 'vehicleCondition'],
      ['Rental type', 'rentalType'],
      ['Rental duration', 'rentalDuration', withUnit('rentalDurationUnit')],
      ['Price per hour', 'pricePerHour', money],
      ['Price per day', 'pricePerDay', money],
      ['Price per week', 'pricePerWeek', money],
      ['Price per month', 'pricePerMonth', money],
      ['Security deposit', 'securityDeposit', money],
      [
        'Minimum rental',
        'minimumRentalDuration',
        withUnit('minimumRentalDurationUnit'),
      ],
      [
        'Maximum rental',
        'maximumRentalDuration',
        withUnit('maximumRentalDurationUnit'),
      ],
      ['KM limit', 'kmLimit', suffix(' km')],
      ['Extra KM charge', 'extraKMCharge', money],
      ['Driver charge', 'driverCharge', money],
      ['Pickup location', 'pickupLocation'],
      ['Drop location', 'dropLocation'],
      ['Minimum driver age', 'ageRequirement', suffix(' years')],
    ],
    flags: [
      ['availability', 'Available', 'check_circle'],
      ['fuelIncluded', 'Fuel included', 'local_gas_station'],
      ['driverIncluded', 'Driver included', 'person'],
      ['pickupAndDropAvailable', 'Pickup & drop', 'transfer_within_a_station'],
      ['insuranceIncluded', 'Insurance included', 'shield'],
      ['depositRequired', 'Deposit required', 'savings'],
    ],
    texts: [['documentsRequired', 'Documents required']],
  },

  [OfferingType.Event]: {
    chips: ['eventType', 'eventCategory', 'venueType'],
    rows: [
      ['Event', 'eventName'],
      ['Date', 'eventDate', date],
      ['End date', 'eventEndDate', date],
      ['Starts', 'startTime', time],
      ['Ends', 'endTime', time],
      ['Venue', 'venueName'],
      ['Address', 'venueAddress'],
      ['City', 'city'],
      ['Capacity', 'capacity'],
      ['Organizer', 'organizerName'],
      ['Contact person', 'contactPerson'],
      ['Ticket price', 'ticketPrice', money],
      ['Early bird price', 'earlyBirdPrice', money],
      ['Register by', 'registrationDeadline', date],
      ['Age limit', 'ageLimit', suffix('+')],
      ['Audience', 'audienceType'],
      ['Language', 'language'],
      ['Registration link', 'registrationURL'],
    ],
    flags: [
      ['ticketRequired', 'Ticket required', 'confirmation_number'],
      ['registrationRequired', 'Registration required', 'how_to_reg'],
      ['foodIncluded', 'Food included', 'restaurant'],
      ['parkingAvailable', 'Parking', 'local_parking'],
      ['accommodationAvailable', 'Accommodation', 'hotel'],
      ['onlineEvent', 'Online event', 'videocam'],
      ['offlineEvent', 'In-person event', 'location_on'],
    ],
    texts: [
      ['eventHighlights', 'Event highlights'],
      ['speakers', 'Speakers'],
      ['performers', 'Performers'],
      ['activities', 'Activities'],
      ['cancellationPolicy', 'Cancellation policy'],
    ],
  },

  [OfferingType.TourPackage]: {
    chips: ['packageType', 'travelMode', 'hotelCategory'],
    rows: [
      ['Package', 'packageName'],
      ['Destination', 'destination'],
      ['Origin', 'origin'],
      [
        'Days & nights',
        'numberOfDays',
        (v, g) => `${v}D / ${g('numberOfNights') || 0}N`,
      ],
      ['Duration', 'duration', withUnit('durationUnit')],
      ['Departure', 'departureDate', date],
      ['Return', 'returnDate', date],
      ['Group size', 'groupSize'],
      ['Minimum group', 'minimumGroupSize'],
      ['Maximum group', 'maximumGroupSize'],
      ['Price per person', 'pricePerPerson', money],
      ['Child price', 'childPrice', money],
      ['Infant price', 'infantPrice', money],
      ['Single occupancy', 'singleOccupancyPrice', money],
      ['Hotel category', 'hotelCategory'],
      ['Room type', 'roomType'],
      ['Book by', 'bookingDeadline', date],
    ],
    flags: [
      ['mealsIncluded', 'Meals included', 'restaurant'],
      ['breakfastIncluded', 'Breakfast', 'free_breakfast'],
      ['lunchIncluded', 'Lunch', 'lunch_dining'],
      ['dinnerIncluded', 'Dinner', 'dinner_dining'],
      ['transportIncluded', 'Transport', 'directions_bus'],
      ['airportTransfer', 'Airport transfer', 'flight_land'],
      ['localTransport', 'Local transport', 'commute'],
      ['sightseeingIncluded', 'Sightseeing', 'photo_camera'],
      ['activitiesIncluded', 'Activities', 'hiking'],
      ['guideIncluded', 'Guide', 'tour'],
      ['entranceFeesIncluded', 'Entrance fees', 'confirmation_number'],
      ['travelInsurance', 'Travel insurance', 'health_and_safety'],
      ['visaAssistance', 'Visa assistance', 'badge'],
    ],
    texts: [
      ['itinerary', 'Itinerary'],
      ['destinationsCovered', 'Destinations covered'],
      ['placesCovered', 'Places covered'],
      ['packageHighlights', 'Package highlights'],
      ['exclusions', 'Exclusions'],
      ['cancellationPolicy', 'Cancellation policy'],
    ],
  },

  [OfferingType.MembershipPlan]: {
    chips: ['planType', 'fitnessCategory', 'membershipType'],
    rows: [
      ['Plan', 'planName'],
      ['Duration', 'duration', withUnit('durationUnit')],
      ['Price', 'price', money],
      ['Joining fee', 'joiningFee', money],
      ['Renewal fee', 'renewalFee', money],
      ['Discount', 'discount', suffix('%')],
      ['Sessions', 'numberOfSessions'],
      ['Trainer', 'trainerName'],
      ['Class types', 'classTypes'],
      ['Fitness level', 'fitnessLevel'],
      ['Age group', 'ageGroup'],
      ['Gender', 'gender'],
      ['Access', 'accessType'],
      ['Available days', 'availableDays'],
      ['Available time', 'availableTime'],
      ['Trial duration', 'trialDuration', withUnit('trialDurationUnit')],
    ],
    flags: [
      ['personalTrainingIncluded', 'Personal training', 'self_improvement'],
      ['groupClassesIncluded', 'Group classes', 'groups'],
      ['trainerIncluded', 'Trainer included', 'person'],
      ['gymAccess', 'Gym access', 'fitness_center'],
      ['equipmentAccess', 'Equipment access', 'fitness_center'],
      ['lockerFacility', 'Lockers', 'lock'],
      ['showerFacility', 'Showers', 'shower'],
      ['saunaAvailable', 'Sauna', 'hot_tub'],
      ['steamRoomAvailable', 'Steam room', 'cloud'],
      ['swimmingPool', 'Swimming pool', 'pool'],
      ['dietConsultation', 'Diet consultation', 'restaurant'],
      ['nutritionPlan', 'Nutrition plan', 'restaurant_menu'],
      ['onlineTraining', 'Online training', 'laptop'],
      ['homeTraining', 'Home training', 'home'],
      ['trialAvailable', 'Trial available', 'timer'],
      ['freeTrial', 'Free trial', 'redeem'],
      ['membershipTransferable', 'Transferable', 'swap_horiz'],
    ],
    texts: [
      ['classSchedule', 'Class schedule'],
      ['cancellationPolicy', 'Cancellation policy'],
    ],
  },
};

/** Builds the display model for any offering type from its raw detail record. */
export function buildOfferingDetailView(
  type: OfferingType | number,
  detail: any,
): OfferingDetailView {
  const cfg = TYPE_CONFIG[Number(type)];
  if (!detail || !cfg) return EMPTY_DETAIL_VIEW;

  // API key casing is not guaranteed (e.g. wiFi / wifi), so read case-insensitively.
  const lc: Record<string, any> = {};
  Object.keys(detail).forEach((k) => (lc[k.toLowerCase()] = detail[k]));
  const g: Getter = (key) => lc[key.toLowerCase()];

  const chips = cfg.chips
    .map((k) => g(k))
    .filter(has)
    .map(String)
    .filter((c, i, arr) => arr.indexOf(c) === i);

  const rows: DetailRow[] = [];
  cfg.rows.forEach(([label, key, fmt]) => {
    const v = g(key);
    if (!has(v)) return;
    const value = (fmt || plain)(v, g);
    if (value) rows.push({ label, value });
  });

  const flags: DetailFlag[] = cfg.flags
    .filter(([key]) => g(key) === true)
    .map(([, label, icon]) => ({ label, icon }));

  const texts: DetailText[] = cfg.texts
    .map(([key, title]) => ({ title, value: g(key) }))
    .filter((t) => has(t.value))
    .map((t) => ({ title: t.title, value: String(t.value) }));

  return { chips, rows, flags, texts };
}
