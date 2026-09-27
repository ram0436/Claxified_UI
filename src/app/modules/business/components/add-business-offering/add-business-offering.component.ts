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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { BusinessService } from '../../service/business.service';
import { OfferingTypeOptionDto } from '../../model/Business';
import {
  BusinessOfferingDto,
  OfferingCourseDto,
  OfferingMedicalServiceDto,
  OfferingMenuItemDto,
  OfferingAccommodationDto,
  OfferingPropertyDto,
  OfferingRentalVehicleDto,
  OfferingEventDto,
  OfferingTourPackageDto,
  OfferingMembershipPlanDto,
  SUPPORTED_OFFERING_TYPES,
} from '../../model/Business';
import { OfferingType } from '../../enum/business-offering.enum';

type SectionId = 'type' | 'basic' | 'details' | 'image';

interface DetailTypeHandler {
  form: FormGroup;
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

  /** Single lookup table mapping an offering type to its detail form and
   * its get/save calls. Adding a new supported offering type later only
   * means adding one entry here (plus a form group + template section). */
  private getDetailHandler(
    offeringType: OfferingType | null,
  ): DetailTypeHandler | null {
    switch (offeringType) {
      case OfferingType.Course:
        return {
          form: this.courseForm,
          get: (id) => this.businessService.getOfferingCourse(id),
          save: (p) => this.businessService.saveOfferingCourse(p),
        };
      case OfferingType.MedicalService:
        return {
          form: this.medicalForm,
          get: (id) => this.businessService.getOfferingMedicalService(id),
          save: (p) => this.businessService.saveOfferingMedicalService(p),
        };
      case OfferingType.MenuItem:
        return {
          form: this.menuItemForm,
          get: (id) => this.businessService.getOfferingMenuItem(id),
          save: (p) => this.businessService.saveOfferingMenuItem(p),
        };
      case OfferingType.RoomAccommodation:
        return {
          form: this.accommodationForm,
          get: (id) => this.businessService.getOfferingAccommodation(id),
          save: (p) => this.businessService.saveOfferingAccommodation(p),
        };
      case OfferingType.Property:
        return {
          form: this.propertyForm,
          get: (id) => this.businessService.getOfferingProperty(id),
          save: (p) => this.businessService.saveOfferingProperty(p),
        };
      case OfferingType.RentalVehicle:
        return {
          form: this.rentalVehicleForm,
          get: (id) => this.businessService.getOfferingRentalVehicle(id),
          save: (p) => this.businessService.saveOfferingRentalVehicle(p),
        };
      case OfferingType.Event:
        return {
          form: this.eventForm,
          get: (id) => this.businessService.getOfferingEvent(id),
          save: (p) => this.businessService.saveOfferingEvent(p),
        };
      case OfferingType.TourPackage:
        return {
          form: this.tourPackageForm,
          get: (id) => this.businessService.getOfferingTourPackage(id),
          save: (p) => this.businessService.saveOfferingTourPackage(p),
        };
      case OfferingType.MembershipPlan:
        return {
          form: this.membershipPlanForm,
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
        (detail) => detail && handler.form.patchValue(detail),
        () => {},
      );
    }

    this.loading = false;
  }

  // ---------- Save ----------

  async onSave(): Promise<void> {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      this.activeSection = 'basic';
      return;
    }

    if (!this.imagePreviewUrl) {
      this.errorMessage = 'Please add an image for this offering.';
      this.activeSection = 'image';
      return;
    }

    this.saving = true;

    let uploadedImageUrl = '';
    try {
      uploadedImageUrl = await this.uploadImageIfNeeded();
    } catch (err) {
      // console.error('[AddOffering] Image upload FAILED:', err);
      this.saving = false;
      this.errorMessage = 'Image upload failed. Please try again.';
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

    this.businessService.saveBusinessOffering(offeringPayload).subscribe(
      (savedOffering) => {
        const businessOfferingId = savedOffering?.id || raw.id;
        this.saveTypeSpecificDetail(businessOfferingId, raw.offeringType);
      },
      (err) => {
        // console.error('[AddOffering] saveBusinessOffering FAILED', err);
        this.saving = false;
        this.errorMessage = 'Failed to save offering. Please try again.';
      },
    );
  }

  private saveTypeSpecificDetail(
    businessOfferingId: number,
    offeringType: OfferingType,
  ): void {
    const handler = this.getDetailHandler(offeringType);

    if (!handler) {
      // No detail API for this offering type - the common record already
      // saved successfully, so treat this as done.
      this.finishSave();
      return;
    }

    const payload = {
      ...handler.form.getRawValue(),
      businessOfferingId,
      businessId: this.businessId,
    };

    handler.save(payload).subscribe(
      () => this.finishSave(),
      (err) => {
        console.error(
          `[AddOffering] detail save FAILED for offeringType=${offeringType}`,
          err,
        );
        this.finishSaveWithWarning();
      },
    );
  }

  private finishSave(): void {
    this.saving = false;
    this.showNotification(
      this.isEditMode
        ? 'Offering updated successfully'
        : 'Offering added successfully',
    );
    this.saved.emit();
  }

  private finishSaveWithWarning(): void {
    this.saving = false;
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
