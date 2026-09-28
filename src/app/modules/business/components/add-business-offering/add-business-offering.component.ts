import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { BusinessService } from '../../service/business.service';
import { OfferingTypeOptionDto } from '../../model/Business';
import {
  BusinessOfferingDto,
  SUPPORTED_OFFERING_TYPES,
  OFFERING_FIELD_OPTIONS,
  OfferingFieldOptions,
} from '../../model/Business';
import { OfferingType } from '../../enum/business-offering.enum';

type SectionId = 'type' | 'basic' | 'details' | 'image';

interface DetailTypeHandler {
  form: FormGroup;
  /** Property name the backend expects this detail wrapped under. */
  wrapperKey: string;
  get: (businessOfferingId: number) => Observable<any>;
  save: (payload: any) => Observable<any>;
}

/** Date fields that must be sent as null (not '') and shown as yyyy-MM-dd */
const DATE_FIELDS = ['startDate', 'endDate', 'eventDate'];

/** Time fields that must be sent as "HH:mm:ss" */
const TIME_FIELDS = ['startTime', 'endTime'];

@Component({
  selector: 'app-add-business-offering',
  templateUrl: './add-business-offering.component.html',
  styleUrls: ['./add-business-offering.component.css'],
})
export class AddBusinessOfferingComponent implements OnInit {
  @Input() businessId!: number;

  @ViewChild('descriptionEditor')
  descriptionEditorRef?: ElementRef<HTMLDivElement>;

  @Input() businessSubCategories: any[] = [];
  @Input() selectedSubCategoryId: number | null = null;
  @Input() offering: BusinessOfferingDto | null = null;
  @Input() presetType: OfferingType | null = null;
  @Input() businessCategoryId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  offeringTypeOptions: OfferingTypeOptionDto[] = [];
  offeringTypesLoading = false;

  @ViewChild('imageInputRef') imageInputRef?: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  courseForm!: FormGroup;
  medicalForm!: FormGroup;
  menuItemForm!: FormGroup;
  accommodationForm!: FormGroup;
  propertyForm!: FormGroup;
  rentalVehicleForm!: FormGroup;
  eventForm!: FormGroup;
  tourPackageForm!: FormGroup;
  membershipPlanForm!: FormGroup;

  loading = false;
  saving = false;
  errorMessage = '';

  activeSection: SectionId = 'type';

  OfferingType = OfferingType;

  /** Preset dropdown values used by the inline suggest inputs in the template */
  opts: OfferingFieldOptions = OFFERING_FIELD_OPTIONS;

  /**
   * Tracks the current text value for every suggest-input in the template.
   * Key = form control path (e.g. 'courseForm.courseType'), value = typed text.
   */
  suggestValues: Record<string, string> = {};

  /** Set to false to silence all [AddOffering] console output */
  private readonly DEBUG = true;

  imagePreviewUrl = '';
  imageFile: File | null = null;
  imageUploading = false;

  get isEditMode(): boolean {
    return !!this.offering?.id;
  }

  get selectedOfferingType(): OfferingType | null {
    return this.form?.getRawValue()?.offeringType ?? null;
  }

  get isSupportedType(): boolean {
    return (
      !!this.selectedOfferingType &&
      SUPPORTED_OFFERING_TYPES.includes(this.selectedOfferingType)
    );
  }

  get detailsSectionLabel(): string {
    switch (this.selectedOfferingType) {
      case OfferingType.Course:
        return 'Course Details';
      case OfferingType.MedicalService:
        return 'Medical Service Details';
      case OfferingType.MenuItem:
        return 'Menu Item Details';
      case OfferingType.RoomAccommodation:
        return 'Room / Accommodation Details';
      case OfferingType.Property:
        return 'Property Details';
      case OfferingType.RentalVehicle:
        return 'Rental Vehicle Details';
      case OfferingType.Event:
        return 'Event Details';
      case OfferingType.TourPackage:
        return 'Tour Package Details';
      case OfferingType.MembershipPlan:
        return 'Membership Plan Details';
      default:
        return 'Details';
    }
  }

  // ---------- Dynamic placeholders per offering type ----------

  /** Name field placeholder */
  get namePlaceholder(): string {
    switch (this.selectedOfferingType) {
      case OfferingType.Course:
        return 'e.g. Full Stack Web Development Bootcamp';
      case OfferingType.MedicalService:
        return 'e.g. Cardiology Consultation — Dr. Anita Sharma';
      case OfferingType.MenuItem:
        return 'e.g. Paneer Butter Masala';
      case OfferingType.RoomAccommodation:
        return 'e.g. Deluxe Sea-View Room';
      case OfferingType.Property:
        return 'e.g. 3BHK Apartment in Whitefield';
      case OfferingType.RentalVehicle:
        return 'e.g. Toyota Innova Crysta (7-Seater)';
      case OfferingType.Event:
        return 'e.g. Free Heart & Diabetes Health Screening Camp';
      case OfferingType.TourPackage:
        return 'e.g. 5-Day Goa Beach Getaway';
      case OfferingType.MembershipPlan:
        return 'e.g. Premium Annual Family Membership';
      default:
        return 'e.g. Name of the offering';
    }
  }

  /** Description field placeholder */
  get descriptionPlaceholder(): string {
    switch (this.selectedOfferingType) {
      case OfferingType.Course:
        return 'Describe the course — what students will learn, duration, delivery format, prerequisites…';
      case OfferingType.MedicalService:
        return 'Describe the medical service — conditions treated, procedures, consultation flow, insurance…';
      case OfferingType.MenuItem:
        return 'Describe the dish — main ingredients, spice level, serving size, chef notes…';
      case OfferingType.RoomAccommodation:
        return 'Describe the room — bed type, amenities, view, check-in/check-out, cancellation policy…';
      case OfferingType.Property:
        return 'Describe the property — location, size, amenities, furnishing, nearby landmarks, possession…';
      case OfferingType.RentalVehicle:
        return 'Describe the vehicle — brand, model, seating, transmission, fuel, inclusions, insurance…';
      case OfferingType.Event:
        return 'Describe the event — what attendees will experience, schedule, artists, highlights, rules…';
      case OfferingType.TourPackage:
        return 'Describe the package — itinerary summary, inclusions/exclusions, group size, best season…';
      case OfferingType.MembershipPlan:
        return 'Describe the plan — benefits, validity, who it suits, discounts, terms, renewal options…';
      default:
        return 'Describe this offering';
    }
  }

  /** Price field placeholder */
  get pricePlaceholder(): string {
    switch (this.selectedOfferingType) {
      case OfferingType.Course:
        return 'Total course fee (e.g. 45000)';
      case OfferingType.MedicalService:
        return 'Consultation fee (e.g. 1200)';
      case OfferingType.MenuItem:
        return 'Item price (e.g. 349)';
      case OfferingType.RoomAccommodation:
        return 'Price per night (e.g. 4500)';
      case OfferingType.Property:
        return 'Sale price or monthly rent (e.g. 8500000)';
      case OfferingType.RentalVehicle:
        return 'Price per day (e.g. 2999)';
      case OfferingType.Event:
        return 'Ticket price (e.g. 4999 — enter 0 if free)';
      case OfferingType.TourPackage:
        return 'Price per person (e.g. 24999)';
      case OfferingType.MembershipPlan:
        return 'Plan price (e.g. 14999)';
      default:
        return 'Price';
    }
  }

  get sections(): {
    id: SectionId;
    label: string;
    icon: string;
    required?: boolean;
  }[] {
    const rest: {
      id: SectionId;
      label: string;
      icon: string;
      required?: boolean;
    }[] = [
      {
        id: 'basic',
        label: 'Basic Details',
        icon: 'storefront',
        required: true,
      },
      { id: 'details', label: this.detailsSectionLabel, icon: 'tune' },
      { id: 'image', label: 'Image', icon: 'photo_library', required: true },
    ];

    if (this.isEditMode || !this.presetType) {
      return [
        {
          id: 'type',
          label: 'Offering Type',
          icon: 'category',
          required: true,
        },
        ...rest,
      ];
    }
    return rest;
  }

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadOfferingTypeOptions();
    this.syncSuggestValuesFromForms();

    if (this.offering) {
      this.patchFromOffering(this.offering);
    } else {
      const fallbackSubCategoryId =
        this.businessSubCategories && this.businessSubCategories.length > 0
          ? Number(this.businessSubCategories[0]) || 0
          : 0;

      const subCategoryId =
        this.selectedSubCategoryId !== null
          ? this.selectedSubCategoryId
          : fallbackSubCategoryId;

      this.form.patchValue({ subCategoryId });

      if (this.presetType !== null) {
        this.form.patchValue({ offeringType: this.presetType });
        this.form.get('offeringType')?.disable();
        this.activeSection = 'basic';
      }
    }
  }

  // ---------- Debug helpers ----------

  /** Logs a deep copy so later mutations don't change what you see. */
  private log(label: string, data?: unknown): void {
    if (!this.DEBUG) return;
    let snapshot: unknown = data;
    try {
      snapshot =
        data === undefined ? undefined : JSON.parse(JSON.stringify(data));
    } catch {
      /* keep original if not serialisable */
    }
    console.log(`[AddOffering] ${label}`, snapshot ?? '');
  }

  private logError(label: string, err: unknown): void {
    if (!this.DEBUG) return;
    console.error(`[AddOffering] ${label}`, err);
  }

  // ---------- Inline suggest-input helpers ----------

  /**
   * Resolves a FormControl from a dot-separated path like 'courseForm.courseType'
   * or just 'name' for the parent form.
   */
  private getControlByPath(path: string): any {
    const parts = path.split('.');
    if (parts.length === 1) {
      return this.form.get(parts[0]);
    }
    const [formName, controlName] = parts;
    const form = (this as any)[formName] as FormGroup | undefined;
    return form?.get(controlName);
  }

  /** Returns the current value for a suggest input, falling back to the form control value. */
  getSuggestValue(path: string): string {
    if (this.suggestValues[path] !== undefined) {
      return this.suggestValues[path];
    }
    const control = this.getControlByPath(path);
    return control?.value ?? '';
  }

  /** Filters preset options based on the current typed text. */
  getFilteredOptions(
    path: string,
    options: readonly string[] | null | undefined,
  ): string[] {
    const v = (this.getSuggestValue(path) || '').toLowerCase();
    return (options || []).filter((o) => o.toLowerCase().includes(v));
  }

  /** Called on every keystroke in a suggest input. Saves typed text to the form control. */
  onSuggestInput(path: string, value: string): void {
    this.suggestValues[path] = value;
    const control = this.getControlByPath(path);
    if (control) {
      control.setValue(value);
      control.markAsDirty();
      control.markAsTouched();
    }
  }

  /** Called when a preset option is selected from the dropdown. */
  onSuggestSelected(path: string, value: string): void {
    this.suggestValues[path] = value;
    const control = this.getControlByPath(path);
    if (control) {
      control.setValue(value);
      control.markAsDirty();
      control.markAsTouched();
    }
  }

  /** Toggles the autocomplete panel for a suggest input. */
  toggleSuggestPanel(path: string, trigger: MatAutocompleteTrigger): void {
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      trigger.openPanel();
    }
  }

  /** Called when a suggest input loses focus. */
  onSuggestBlur(path: string): void {
    const control = this.getControlByPath(path);
    if (control) {
      control.markAsTouched();
    }
  }

  /**
   * Seeds suggestValues from the current form values.
   * Call this after building forms / patching data so the inputs show existing values.
   */
  private syncSuggestValuesFromForms(): void {
    const formMap: Record<string, FormGroup> = {
      courseForm: this.courseForm,
      medicalForm: this.medicalForm,
      menuItemForm: this.menuItemForm,
      accommodationForm: this.accommodationForm,
      propertyForm: this.propertyForm,
      rentalVehicleForm: this.rentalVehicleForm,
      eventForm: this.eventForm,
      tourPackageForm: this.tourPackageForm,
      membershipPlanForm: this.membershipPlanForm,
    };

    for (const [formName, form] of Object.entries(formMap)) {
      if (!form) continue;
      for (const key of Object.keys(form.controls)) {
        const val = form.get(key)?.value;
        if (typeof val === 'string') {
          this.suggestValues[`${formName}.${key}`] = val;
        }
      }
    }
  }

  // ---------- Date / time helpers ----------

  /** "2026-11-20" or ISO -> Date (local midnight) */
  private parseYmd(v: string | null | undefined): Date | null {
    if (!v) return null;
    const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    if (!ymd) return null;
    return new Date(+ymd[1], +ymd[2] - 1, +ymd[3]);
  }

  /** Date -> "yyyy-MM-dd" (local, no timezone shift) */
  private formatYmd(d: Date | null | undefined): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** "9:00 AM" -> "09:00"; "09:00:00" -> "09:00"; "09:00" -> "09:00"; null -> "" */
  private normalizeTimeForInput(value: string | null | undefined): string {
    if (!value) return '';

    // Already "HH:mm" or "HH:mm:ss"
    const hhmm = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
    if (hhmm) {
      const h = hhmm[1].padStart(2, '0');
      const m = hhmm[2];
      return `${h}:${m}`;
    }

    // "9:00 AM" / "9:00 PM"
    const ampm = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value);
    if (ampm) {
      let h = parseInt(ampm[1], 10);
      const m = ampm[2];
      const meridiem = ampm[3].toUpperCase();
      if (meridiem === 'PM' && h !== 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${m}`;
    }

    return value;
  }

  /** "09:00" -> "09:00:00"; "" -> null */
  private normalizeTimeForPayload(
    value: string | null | undefined,
  ): string | null {
    if (!value || !value.trim()) return null;
    // value from <input type="time"> is "HH:mm"
    if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    // already "HH:mm:ss"
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    return value;
  }

  // ---------- Offering type options ----------

  private loadOfferingTypeOptions(): void {
    if (!this.businessCategoryId) return;
    this.offeringTypesLoading = true;

    this.businessService
      .getOfferingTypesByBusinessCategory(this.businessCategoryId)
      .subscribe(
        (types) => {
          this.offeringTypeOptions = (types || []).filter(
            (t) =>
              t.value !== OfferingType.Product &&
              t.value !== OfferingType.Service,
          );
          this.offeringTypesLoading = false;
        },
        () => {
          this.offeringTypeOptions = [];
          this.offeringTypesLoading = false;
        },
      );
  }

  private buildForms(): void {
    this.form = this.fb.group({
      id: [0],
      offeringType: [null, Validators.required],
      subCategoryId: [0, Validators.required],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      isActive: [true],
      displayOrder: [0],
    });

    this.courseForm = this.fb.group({
      id: [0],
      courseType: [''],
      courseCategory: [''],
      courseLevel: [''],
      duration: [0],
      durationUnit: [''],
      modeOfLearning: [''],
      classSchedule: [''],
      startDate: [null],
      endDate: [null],
      eligibility: [''],
      ageGroup: [''],
      language: [''],
      curriculum: [''],
      subjectsCovered: [''],
      certification: [''],
      accreditation: [''],
      instructorName: [''],
      instituteName: [''],
      batchSize: [0],
      feeFrequency: [''],
      registrationFee: [0],
      discount: [0],
      scholarshipAvailable: [false],
      studyMaterialIncluded: [false],
      examIncluded: [false],
      placementAssistance: [false],
      internshipAvailable: [false],
      courseHighlights: [''],
    });

    this.medicalForm = this.fb.group({
      id: [0],
      serviceType: [''],
      medicalSpecialty: [''],
      department: [''],
      doctorName: [''],
      qualification: [''],
      experience: [0],
      gender: [''],
      serviceMode: [''],
      consultationType: [''],
      followUpFee: [0],
      appointmentRequired: [false],
      emergencyService: [false],
      homeVisitAvailable: [false],
      teleconsultationAvailable: [false],
      serviceDuration: [0],
      serviceDurationUnit: [''],
      availableDays: [''],
      availableTime: [''],
      insuranceAccepted: [false],
      cashlessAvailable: [false],
      labFacility: [false],
      pharmacyAvailable: [false],
      ambulanceAvailable: [false],
      ageGroup: [''],
      conditionsTreated: [''],
      procedures: [''],
      serviceHighlights: [''],
    });

    this.menuItemForm = this.fb.group({
      id: [0],
      cuisineType: [''],
      foodType: [''],
      spiceLevel: [''],
      preparationTime: [0],
      preparationTimeUnit: [''],
      servingSize: [''],
      calories: [0],
      ingredients: [''],
      allergens: [''],
      isChefSpecial: [false],
      isCustomizable: [false],
      isAvailable: [true],
    });

    this.accommodationForm = this.fb.group({
      id: [0],
      roomType: [''],
      bedType: [''],
      maxOccupancy: [0],
      roomSizeSqft: [0],
      viewType: [''],
      checkInTime: [''],
      checkOutTime: [''],
      amenities: [''],
      breakfastIncluded: [false],
      freeCancellation: [false],
      cancellationPolicy: [''],
      isAvailable: [true],
    });

    this.propertyForm = this.fb.group({
      id: [0],
      propertyType: [''],
      listingType: [''],
      bedrooms: [0],
      bathrooms: [0],
      areaSqft: [0],
      floorNumber: [0],
      totalFloors: [0],
      furnishingStatus: [''],
      facing: [''],
      ageOfPropertyYears: [0],
      amenities: [''],
      possessionStatus: [''],
      isNegotiable: [false],
    });

    this.rentalVehicleForm = this.fb.group({
      id: [0],
      vehicleType: [''],
      brand: [''],
      model: [''],
      year: [0],
      transmissionType: [''],
      fuelType: [''],
      seatingCapacity: [0],
      registrationNumber: [''],
      pricePerHour: [0],
      pricePerDay: [0],
      securityDeposit: [0],
      mileageLimitPerDay: [0],
      withDriver: [false],
      isAvailable: [true],
    });

    this.eventForm = this.fb.group({
      id: [0],
      eventType: [''],
      eventDate: [null],
      startTime: [''],
      endTime: [''],
      venue: [''],
      capacity: [0],
      ticketType: [''],
      organizerName: [''],
      artistOrPerformer: [''],
      ageRestriction: [''],
      dressCode: [''],
      isFreeEntry: [false],
      refundPolicy: [''],
    });

    this.tourPackageForm = this.fb.group({
      id: [0],
      destination: [''],
      packageType: [''],
      duration: [0],
      durationUnit: [''],
      groupSize: [0],
      startDate: [null],
      endDate: [null],
      inclusions: [''],
      exclusions: [''],
      itinerary: [''],
      accommodationIncluded: [false],
      mealsIncluded: [false],
      transportIncluded: [false],
      cancellationPolicy: [''],
    });

    this.membershipPlanForm = this.fb.group({
      id: [0],
      planType: [''],
      validityPeriod: [0],
      validityUnit: [''],
      benefits: [''],
      maxUsers: [0],
      discountPercentage: [0],
      freeTrialDays: [0],
      isRenewable: [false],
      autoRenewal: [false],
      termsAndConditions: [''],
    });
  }

  /** Single lookup table mapping an offering type to its detail form,
   * its API wrapper key, and its get/save calls. */
  private getDetailHandler(
    offeringType: OfferingType | null,
  ): DetailTypeHandler | null {
    switch (offeringType) {
      case OfferingType.Course:
        return {
          form: this.courseForm,
          wrapperKey: 'businessOfferingCourse',
          get: (id) => this.businessService.getOfferingCourse(id),
          save: (p) => this.businessService.saveOfferingCourse(p),
        };
      case OfferingType.MedicalService:
        return {
          form: this.medicalForm,
          wrapperKey: 'businessOfferingMedicalService',
          get: (id) => this.businessService.getOfferingMedicalService(id),
          save: (p) => this.businessService.saveOfferingMedicalService(p),
        };
      case OfferingType.MenuItem:
        return {
          form: this.menuItemForm,
          wrapperKey: 'businessOfferingMenuItem',
          get: (id) => this.businessService.getOfferingMenuItem(id),
          save: (p) => this.businessService.saveOfferingMenuItem(p),
        };
      case OfferingType.RoomAccommodation:
        return {
          form: this.accommodationForm,
          wrapperKey: 'businessOfferingAccommodation',
          get: (id) => this.businessService.getOfferingAccommodation(id),
          save: (p) => this.businessService.saveOfferingAccommodation(p),
        };
      case OfferingType.Property:
        return {
          form: this.propertyForm,
          wrapperKey: 'businessOfferingProperty',
          get: (id) => this.businessService.getOfferingProperty(id),
          save: (p) => this.businessService.saveOfferingProperty(p),
        };
      case OfferingType.RentalVehicle:
        return {
          form: this.rentalVehicleForm,
          wrapperKey: 'businessOfferingRentalVehicle',
          get: (id) => this.businessService.getOfferingRentalVehicle(id),
          save: (p) => this.businessService.saveOfferingRentalVehicle(p),
        };
      case OfferingType.Event:
        return {
          form: this.eventForm,
          wrapperKey: 'businessOfferingEvent',
          get: (id) => this.businessService.getOfferingEvent(id),
          save: (p) => this.businessService.saveOfferingEvent(p),
        };
      case OfferingType.TourPackage:
        return {
          form: this.tourPackageForm,
          wrapperKey: 'businessOfferingTourPackage',
          get: (id) => this.businessService.getOfferingTourPackage(id),
          save: (p) => this.businessService.saveOfferingTourPackage(p),
        };
      case OfferingType.MembershipPlan:
        return {
          form: this.membershipPlanForm,
          wrapperKey: 'businessOfferingMembershipPlan',
          get: (id) => this.businessService.getOfferingMembershipPlan(id),
          save: (p) => this.businessService.saveOfferingMembershipPlan(p),
        };
      default:
        return null;
    }
  }

  setSection(id: SectionId): void {
    this.activeSection = id;

    if (id === 'basic') {
      setTimeout(() => {
        if (this.descriptionEditorRef) {
          this.descriptionEditorRef.nativeElement.innerHTML =
            this.form.get('description')?.value || '';
        }
      });
    }
  }

  get isLastSection(): boolean {
    return this.activeSection === 'image';
  }

  goToNextSection(): void {
    const order: SectionId[] = this.sections.map((s) => s.id);
    const current = this.sections.find((s) => s.id === this.activeSection);

    if (current?.required && !this.isSectionFilled(this.activeSection)) {
      this.errorMessage = `Please complete the ${current.label} section`;
      return;
    }

    this.errorMessage = '';

    const idx = order.indexOf(this.activeSection);
    if (idx > -1 && idx < order.length - 1) {
      this.setSection(order[idx + 1]);
    }
  }

  exec(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
    this.descriptionEditorRef?.nativeElement.focus();
    if (this.descriptionEditorRef) {
      this.onDescriptionInput(this.descriptionEditorRef.nativeElement);
    }
  }

  insertLink(): void {
    const url = window.prompt('Enter a URL');
    if (url) {
      this.exec('createLink', url);
    }
  }

  onDescriptionInput(el: HTMLDivElement): void {
    this.form.patchValue({ description: el.innerHTML });
  }

  isSectionFilled(id: SectionId): boolean {
    switch (id) {
      case 'type':
        return !!this.form.get('offeringType')?.valid;
      case 'basic':
        return (
          !!this.form.get('name')?.valid && !!this.form.get('price')?.valid
        );
      case 'details':
        return true;
      case 'image':
        return !!this.imagePreviewUrl;
      default:
        return false;
    }
  }

  // ---------- Image ----------

  selectImage(): void {
    this.imageInputRef?.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.imageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(this.imageFile);
    input.value = '';
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreviewUrl = '';
  }

  private uploadImageIfNeeded(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.imageFile) {
        resolve(
          this.imagePreviewUrl && !this.imagePreviewUrl.startsWith('data:')
            ? this.imagePreviewUrl
            : '',
        );
        return;
      }

      const formData = new FormData();
      formData.append('files', this.imageFile);
      this.imageUploading = true;

      this.businessService.uploadProductImages(formData).subscribe(
        (urls: string[]) => {
          this.imageUploading = false;
          resolve(urls[0] || '');
        },
        (err) => {
          this.imageUploading = false;
          reject(err);
        },
      );
    });
  }

  // ---------- Patch (edit mode) ----------

  private patchFromOffering(o: BusinessOfferingDto): void {
    this.loading = true;

    this.form.patchValue({
      id: o.id,
      offeringType: o.offeringType,
      subCategoryId: o.subCategoryId,
      name: o.name,
      description: o.description,
      price: o.price,
      isActive: o.isActive,
      displayOrder: o.displayOrder,
    });

    this.form.get('offeringType')?.disable();
    this.imagePreviewUrl = o.imageUrl || '';

    const handler = this.getDetailHandler(o.offeringType);
    if (handler) {
      handler.get(o.id).subscribe(
        (res) => {
          // The API may return the object directly, or wrapped under
          // its businessOfferingXxx key. Handle both shapes.
          const detail =
            res && typeof res === 'object' && handler.wrapperKey in res
              ? (res as any)[handler.wrapperKey]
              : res;

          this.log(`Loaded detail for offeringType=${o.offeringType}`, detail);
          if (detail) {
            handler.form.patchValue(this.normalizeDatesForInput(detail));
            this.syncSuggestValuesFromForms();
          }
        },
        (err) => this.logError('Failed to load detail', err),
      );
    }

    this.loading = false;
  }

  /** Normalizes dates to Date objects (for mat-datepicker) and times to "HH:mm". */
  private normalizeDatesForInput(detail: any): any {
    const copy = { ...detail };
    DATE_FIELDS.forEach((f) => {
      if (typeof copy[f] === 'string' && copy[f].length >= 10) {
        copy[f] = this.parseYmd(copy[f]);
      } else if (!copy[f]) {
        copy[f] = null;
      }
    });
    TIME_FIELDS.forEach((f) => {
      if (typeof copy[f] === 'string') {
        copy[f] = this.normalizeTimeForInput(copy[f]);
      }
    });
    return copy;
  }

  /** Dates -> "yyyy-MM-dd" | null; times -> "HH:mm:ss" | null. */
  private normalizeDatesForPayload(payload: any): any {
    const copy = { ...payload };
    DATE_FIELDS.forEach((f) => {
      if (!(f in copy)) return;
      const v = copy[f];
      if (!v) {
        copy[f] = null;
      } else if (v instanceof Date) {
        copy[f] = this.formatYmd(v);
      } else if (typeof v === 'string') {
        copy[f] = v.substring(0, 10);
      }
    });
    TIME_FIELDS.forEach((f) => {
      if (f in copy) {
        copy[f] = this.normalizeTimeForPayload(copy[f]);
      }
    });
    return copy;
  }

  // ---------- Save ----------

  async onSave(): Promise<void> {
    this.errorMessage = '';
    console.groupCollapsed?.('[AddOffering] ===== SAVE STARTED =====');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      this.activeSection = 'basic';
      this.log('Blocked: parent form invalid', this.form.getRawValue());
      console.groupEnd?.();
      return;
    }

    if (!this.imagePreviewUrl) {
      this.errorMessage = 'Please add an image for this offering.';
      this.activeSection = 'image';
      this.log('Blocked: no image');
      console.groupEnd?.();
      return;
    }

    this.saving = true;

    let uploadedImageUrl = '';
    try {
      uploadedImageUrl = await this.uploadImageIfNeeded();
      this.log('Image uploaded, url =', uploadedImageUrl);
    } catch (err) {
      this.logError('Image upload FAILED', err);
      this.saving = false;
      this.errorMessage = 'Image upload failed. Please try again.';
      console.groupEnd?.();
      return;
    }

    const raw = this.form.getRawValue();

    const offeringPayload: BusinessOfferingDto = {
      id: raw.id,
      businessId: this.businessId,
      subCategoryId: raw.subCategoryId,
      offeringType: raw.offeringType,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      imageUrl: uploadedImageUrl,
      isActive: raw.isActive,
      displayOrder: raw.displayOrder,
    };

    this.log(
      '1) PARENT payload -> POST Business/business-offering',
      offeringPayload,
    );

    this.businessService.saveBusinessOffering(offeringPayload).subscribe(
      (savedOffering) => {
        this.log('1) PARENT response', savedOffering);
        const businessOfferingId = savedOffering?.id || raw.id;
        this.saveTypeSpecificDetail(businessOfferingId, raw.offeringType);
      },
      (err) => {
        this.logError('1) PARENT save FAILED', err);
        this.saving = false;
        this.errorMessage = 'Failed to save offering. Please try again.';
        console.groupEnd?.();
      },
    );
  }

  private saveTypeSpecificDetail(
    businessOfferingId: number,
    offeringType: OfferingType,
  ): void {
    const handler = this.getDetailHandler(offeringType);

    if (!handler) {
      this.log(
        `2) No detail handler for offeringType=${offeringType} - skipping detail save`,
      );
      this.finishSave();
      return;
    }

    // Trim every string field so no stray tabs/spaces get sent.
    const rawDetail = handler.form.getRawValue();
    const trimmedDetail = Object.fromEntries(
      Object.entries(rawDetail).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() : v,
      ]),
    );

    // Normalize dates and times, then add the ids.
    const innerPayload = this.normalizeDatesForPayload({
      ...trimmedDetail,
      businessOfferingId,
      businessId: this.businessId,
    });

    // Wrap under the property name the backend expects.
    const payload = { [handler.wrapperKey]: innerPayload };

    this.log(
      `2) DETAIL payload (offeringType=${
        OfferingType[offeringType] ?? offeringType
      }, wrapperKey=${handler.wrapperKey})`,
      payload,
    );
    if (this.DEBUG && console.table) {
      console.table(innerPayload);
    }

    handler.save(payload).subscribe(
      (res) => {
        this.log('2) DETAIL response', res);
        this.finishSave();
      },
      (err) => {
        this.logError(
          `2) DETAIL save FAILED for offeringType=${offeringType}`,
          err,
        );
        console.error(
          '[AddOffering] API validation errors:',
          err?.error?.errors,
        );
        this.finishSaveWithWarning();
      },
    );
  }

  private finishSave(): void {
    this.saving = false;
    this.log('===== SAVE COMPLETE =====');
    console.groupEnd?.();
    this.showNotification(
      this.isEditMode
        ? 'Offering updated successfully'
        : 'Offering added successfully',
    );
    this.saved.emit();
  }

  private finishSaveWithWarning(): void {
    this.saving = false;
    this.log('===== SAVE COMPLETE WITH DETAIL WARNING =====');
    console.groupEnd?.();
    this.showNotification(
      'Offering saved, but its details failed to save. Please edit and try again.',
    );
    this.saved.emit();
  }

  dismiss(): void {
    this.close.emit();
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
