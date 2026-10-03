import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { BusinessService } from '../../service/business.service';
import { OfferingTypeOptionDto } from '../../model/Business';
import {
  BusinessOfferingDto,
  OfferingMedicalServiceSavePayload,
  SUPPORTED_OFFERING_TYPES,
  OFFERING_FIELD_OPTIONS,
  OfferingFieldOptions,
} from '../../model/Business';
import { OfferingType } from '../../enum/business-offering.enum';

import {
  DETAIL_CONFIG,
  DATE_FIELDS,
  END_OF_DAY_FIELDS,
  TIME_FIELDS,
  GenericDetailConfig,
  LayoutBlock,
  buildLayout,
  defaultFor,
} from '../../model/offering-detail-field';

type SectionId = 'type' | 'basic' | 'details' | 'image';

interface DetailTypeHandler {
  form: FormGroup;
  /** Property name the backend expects this detail wrapped under. */
  wrapperKey: string;
  get: (businessOfferingId: number) => Observable<any>;
  save: (payload: any) => Observable<any>;
}

@Component({
  selector: 'app-add-business-offering',
  templateUrl: './add-business-offering.component.html',
  styleUrls: ['./add-business-offering.component.css'],
})
export class AddBusinessOfferingComponent implements OnInit {
  @Input() businessId!: number;

  descriptionEditorRef?: ElementRef<HTMLDivElement>;

  @ViewChild('descriptionEditor')
  set descriptionEditor(ref: ElementRef<HTMLDivElement> | undefined) {
    this.descriptionEditorRef = ref;
    if (ref) {
      ref.nativeElement.innerHTML = this.form?.get('description')?.value || '';
    }
  }

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

    if (!this.isEditMode && !this.presetType) {
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
    // console.log(`[AddOffering] ${label}`, snapshot ?? '');
  }

  private logError(label: string, err: unknown): void {
    if (!this.DEBUG) return;
    // console.error(`[AddOffering] ${label}`, err);
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

    this.menuItemForm = this.genericFormFor(OfferingType.MenuItem);
    this.accommodationForm = this.genericFormFor(
      OfferingType.RoomAccommodation,
    );
    this.propertyForm = this.genericFormFor(OfferingType.Property);
    this.rentalVehicleForm = this.genericFormFor(OfferingType.RentalVehicle);
    this.eventForm = this.genericFormFor(OfferingType.Event);
    this.tourPackageForm = this.genericFormFor(OfferingType.TourPackage);
    this.membershipPlanForm = this.genericFormFor(OfferingType.MembershipPlan);
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

    this.activeSection = 'basic';

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
          const detail = this.extractDetail(res, handler.wrapperKey);
          // this.log(`Loaded detail for offeringType=${o.offeringType}`, detail);

          if (!detail) {
            // this.log('No detail record returned for this offering');
            return;
          }

          const aligned = this.alignKeys(detail, handler.form);
          handler.form.patchValue(this.normalizeDatesForInput(aligned));
          this.syncSuggestValuesFromForms();
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

  private normalizeDatesForPayload(payload: any): any {
    const copy = { ...payload };
    DATE_FIELDS.forEach((f) => {
      if (!(f in copy)) return;
      const v = copy[f];
      let ymd: string | null = null;
      if (v instanceof Date) ymd = this.formatYmd(v);
      else if (typeof v === 'string' && v) ymd = v.substring(0, 10);

      copy[f] = ymd
        ? `${ymd}T${END_OF_DAY_FIELDS.includes(f) ? '23:59:59' : '00:00:00'}Z`
        : null;
    });
    TIME_FIELDS.forEach((f) => {
      if (f in copy) copy[f] = this.normalizeTimeForPayload(copy[f]);
    });
    return copy;
  }

  private buildDetailInner(
    handler: DetailTypeHandler,
    businessOfferingId: number,
  ): any {
    const rawDetail = handler.form.getRawValue();
    const trimmedDetail = Object.fromEntries(
      Object.entries(rawDetail).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() : v,
      ]),
    );

    return this.normalizeDatesForPayload({
      ...trimmedDetail,
      businessOfferingId,
      businessId: this.businessId,
    });
  }

  private saveMedicalServiceCombined(offering: BusinessOfferingDto): void {
    const handler = this.getDetailHandler(OfferingType.MedicalService)!;

    const payload: OfferingMedicalServiceSavePayload = {
      businessOffering: offering,
      businessOfferingMedicalService: this.buildDetailInner(
        handler,
        offering.id,
      ),
    };

    this.businessService.saveOfferingMedicalService(payload).subscribe(
      () => this.finishSave(),
      () => {
        this.saving = false;
        this.errorMessage = 'Failed to save offering. Please try again.';
      },
    );
  }

  // ---------- Save ----------

  async onSave(): Promise<void> {
    this.errorMessage = '';
    // console.groupCollapsed?.('[AddOffering] ===== SAVE STARTED =====');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      this.activeSection = 'basic';
      // this.log('Blocked: parent form invalid', this.form.getRawValue());
      // console.groupEnd?.();
      return;
    }

    if (!this.imagePreviewUrl) {
      this.errorMessage = 'Please add an image for this offering.';
      this.activeSection = 'image';
      // this.log('Blocked: no image');
      // console.groupEnd?.();
      return;
    }

    this.saving = true;

    let uploadedImageUrl = '';
    try {
      uploadedImageUrl = await this.uploadImageIfNeeded();
      // this.log('Image uploaded, url =', uploadedImageUrl);
    } catch (err) {
      // this.logError('Image upload FAILED', err);
      this.saving = false;
      this.errorMessage = 'Image upload failed. Please try again.';
      // console.groupEnd?.();
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

    if (Number(raw.offeringType) === Number(OfferingType.MedicalService)) {
      this.saveMedicalServiceCombined(offeringPayload);
      return;
    }

    // this.log(
    //   '1) PARENT payload -> POST Business/business-offering',
    //   offeringPayload,
    // );

    this.businessService.saveBusinessOffering(offeringPayload).subscribe(
      (savedOffering) => {
        // this.log('1) PARENT response', savedOffering);
        const businessOfferingId = savedOffering?.id || raw.id;
        this.saveTypeSpecificDetail(businessOfferingId, raw.offeringType);
      },
      (err) => {
        // this.logError('1) PARENT save FAILED', err);
        this.saving = false;
        this.errorMessage = 'Failed to save offering. Please try again.';
        // console.groupEnd?.();
      },
    );
  }

  private saveTypeSpecificDetail(
    businessOfferingId: number,
    offeringType: OfferingType,
  ): void {
    const handler = this.getDetailHandler(offeringType);

    if (!handler) {
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

    // this.log(
    //   `2) DETAIL payload (offeringType=${
    //     OfferingType[offeringType] ?? offeringType
    //   }, wrapperKey=${handler.wrapperKey})`,
    //   payload,
    // );
    // if (this.DEBUG && console.table) {
    //   console.table(innerPayload);
    // }

    const innerPayload = this.buildDetailInner(handler, businessOfferingId);
    const payload = { [handler.wrapperKey]: innerPayload };

    handler.save(payload).subscribe(
      () => this.finishSave(),
      () => this.finishSaveWithWarning(),
    );
  }

  private finishSave(): void {
    this.saving = false;
    // this.log('===== SAVE COMPLETE =====');
    // console.groupEnd?.();
    this.showNotification(
      this.isEditMode
        ? 'Offering updated successfully'
        : 'Offering added successfully',
    );
    this.saved.emit();
  }

  private finishSaveWithWarning(): void {
    this.saving = false;
    // this.log('===== SAVE COMPLETE WITH DETAIL WARNING =====');
    // console.groupEnd?.();
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

  private layoutCache = new Map<number, LayoutBlock[]>();

  get genericConfig(): GenericDetailConfig | null {
    const t = this.selectedOfferingType;
    return t != null ? (DETAIL_CONFIG[t] ?? null) : null;
  }

  get genericForm(): FormGroup | null {
    const c = this.genericConfig;
    return c ? ((this as any)[c.formName] as FormGroup) : null;
  }

  get genericLayout(): LayoutBlock[] {
    const t = this.selectedOfferingType as number;
    const c = this.genericConfig;
    if (!c) return [];
    if (!this.layoutCache.has(t)) {
      this.layoutCache.set(t, buildLayout(c.fields));
    }
    return this.layoutCache.get(t)!;
  }

  ctrl(key: string): FormControl {
    return this.genericForm!.get(key) as FormControl;
  }

  genericPath(key: string): string {
    return `${this.genericConfig!.formName}.${key}`;
  }

  private genericFormFor(type: OfferingType): FormGroup {
    const controls: Record<string, any> = { id: [0] };
    DETAIL_CONFIG[type]!.fields.forEach(
      (f) => (controls[f.key] = [defaultFor(f)]),
    );
    return this.fb.group(controls);
  }

  /** Unwraps: array -> first item, {wrapperKey: {...}} -> inner, {anyKey: {...}} -> inner */
  private extractDetail(res: any, wrapperKey: string): any {
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

  /** Matches API keys to form control names case-insensitively and drops nulls */
  private alignKeys(detail: any, form: FormGroup): any {
    const controlNames = new Map(
      Object.keys(form.controls).map((k) => [k.toLowerCase(), k]),
    );
    const out: any = {};
    Object.entries(detail).forEach(([k, v]) => {
      const target = controlNames.get(k.toLowerCase());
      if (target && v !== null && v !== undefined) out[target] = v;
    });
    return out;
  }
}
