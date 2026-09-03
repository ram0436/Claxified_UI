import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { BusinessService } from "../../service/business.service";
import {
  BusinessServiceDto,
  ServicePricingType,
  ServiceMode,
  ServiceAvailabilityStatus,
  ServiceDurationUnit,
  SERVICE_PRICING_TYPE_OPTIONS,
  SERVICE_MODE_OPTIONS,
  SERVICE_AVAILABILITY_STATUS_OPTIONS,
  SERVICE_DURATION_UNIT_OPTIONS,
  AttributeMasterDto,
} from "../../model/Business";
import { MatSnackBar } from "@angular/material/snack-bar";
import { EntityType } from "../../enum/business-product.enum";

interface ServiceImagePreview {
  localId: number;
  file?: File;
  previewUrl: string;
  uploadedUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  uploading: boolean;
}

type SectionId = "basic" | "attributes" | "pricing" | "details" | "images";

@Component({
  selector: "app-add-business-service",
  templateUrl: "./add-business-service.component.html",
  styleUrls: ["./add-business-service.component.css"],
})
export class AddBusinessServiceComponent implements OnInit, AfterViewInit {
  @Input() businessId!: number;
  @Input() businessCategoryId!: number;

  /**
   * Business can have multiple subcategories.
   *
   * Service API still accepts only ONE subcategory ID.
   * The selected ID is therefore handled internally and
   * is not displayed to the user.
   */
  @Input() businessSubCategories: any[] = [];

  @Input() service: BusinessServiceDto | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  @ViewChild("aboutEditor")
  aboutEditorRef?: ElementRef<HTMLDivElement>;

  form!: FormGroup;

  loading = false;
  saving = false;
  errorMessage = "";

  activeSection: SectionId = "basic";

  sections: {
    id: SectionId;
    label: string;
    icon: string;
    required?: boolean;
  }[] = [
    {
      id: "basic",
      label: "Basic Details",
      icon: "storefront",
      required: true,
    },
    {
      id: "attributes",
      label: "Attributes",
      icon: "tune",
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: "sell",
      required: true,
    },
    {
      id: "details",
      label: "Service Details",
      icon: "design_services",
    },
    {
      id: "images",
      label: "Images",
      icon: "photo_library",
      required: true,
    },
  ];

  attributeDefs: AttributeMasterDto[] = [];

  pricingTypeOptions = SERVICE_PRICING_TYPE_OPTIONS;
  serviceModeOptions = SERVICE_MODE_OPTIONS;
  availabilityOptions = SERVICE_AVAILABILITY_STATUS_OPTIONS;
  durationUnitOptions = SERVICE_DURATION_UNIT_OPTIONS;

  images: ServiceImagePreview[] = [];

  private imgCounter = 0;

  loadingAttributes = false;

  /**
   * Internal service subcategory.
   *
   * This is NOT displayed in the UI.
   *
   * New service:
   *   first business subcategory is used.
   *
   * Edit service:
   *   existing serviceSubCategoryId is preserved.
   */
  private serviceSubCategoryId = 0;

  get isEditMode(): boolean {
    return !!this.service?.id;
  }

  get attributesArray(): FormArray {
    return this.form.get("attributes") as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    /**
     * Determine the internal service subcategory
     * before creating the form.
     */
    this.setInternalServiceSubCategoryId();

    this.buildForm();

    this.activeSection = "basic";

    if (this.service) {
      this.patchFromService(this.service);
    } else {
      this.resolveAttributesForSubCategory(this.serviceSubCategoryId);
    }
  }

  ngAfterViewInit(): void {
    this.hydrateAboutEditor();
  }

  /**
   * Determines the single subcategory ID that will be
   * sent to the existing Service API.
   *
   * The user never sees this value.
   */
  private setInternalServiceSubCategoryId(): void {
    /**
     * EDIT MODE
     *
     * Always preserve the existing service's
     * subcategory.
     */
    if (this.service?.serviceSubCategoryId) {
      this.serviceSubCategoryId = Number(this.service.serviceSubCategoryId);

      return;
    }

    /**
     * ADD MODE
     *
     * Business can have multiple subcategories.
     *
     * Since the Service API currently accepts only
     * one subcategory, use the first business
     * subcategory internally.
     */
    if (this.businessSubCategories && this.businessSubCategories.length > 0) {
      this.serviceSubCategoryId = Number(this.businessSubCategories[0]) || 0;

      return;
    }

    this.serviceSubCategoryId = 0;
  }

  setSection(id: SectionId): void {
    this.activeSection = id;

    if (id === "basic") {
      this.hydrateAboutEditor();
    }
  }

  private hydrateAboutEditor(): void {
    setTimeout(() => {
      if (this.aboutEditorRef) {
        this.aboutEditorRef.nativeElement.innerHTML =
          this.form.get("about")?.value || "";
      }
    });
  }

  exec(command: string, value: string = ""): void {
    document.execCommand(command, false, value);

    this.aboutEditorRef?.nativeElement.focus();

    if (this.aboutEditorRef) {
      this.onAboutInput(this.aboutEditorRef.nativeElement);
    }
  }

  insertLink(): void {
    const url = window.prompt("Enter a URL");

    if (url) {
      this.exec("createLink", url);
    }
  }

  onAboutInput(el: HTMLDivElement): void {
    this.form.get("about")?.setValue(el.innerHTML);
  }

  private defaultValue() {
    return {
      id: 0,
      serviceName: "",
      shortDescription: "",
      about: "",
      minimumPrice: null,
      maximumPrice: null,
      pricingType: ServicePricingType.FixedPrice,
      gstIncluded: false,
      serviceMode: ServiceMode.AtBusiness,
      serviceArea: "",
      duration: 0,
      durationUnit: ServiceDurationUnit.Hour,
      isBookingRequired: false,
      availability: ServiceAvailabilityStatus.Available,
      isActive: true,
    };
  }

  private buildForm(): void {
    const v = this.defaultValue();

    this.form = this.fb.group({
      id: [v.id],

      serviceName: [
        v.serviceName,
        [Validators.required, Validators.maxLength(150)],
      ],

      serviceCategoryId: [this.businessCategoryId, Validators.required],

      /**
       * INTERNAL ONLY.
       *
       * Do not create an input/select/checkbox for this
       * field in the HTML.
       */
      serviceSubCategoryId: [this.serviceSubCategoryId, Validators.required],

      shortDescription: [v.shortDescription, Validators.maxLength(250)],

      about: [v.about],

      minimumPrice: [v.minimumPrice, [Validators.required, Validators.min(0)]],

      maximumPrice: [v.maximumPrice, Validators.min(0)],

      pricingType: [v.pricingType, Validators.required],

      gstIncluded: [v.gstIncluded],

      serviceMode: [v.serviceMode, Validators.required],

      serviceArea: [v.serviceArea],

      duration: [v.duration, Validators.min(0)],

      durationUnit: [v.durationUnit],

      isBookingRequired: [v.isBookingRequired],

      availability: [v.availability, Validators.required],

      isActive: [v.isActive],

      attributes: this.fb.array([]),
    });

    this.form
      .get("pricingType")!
      .valueChanges.subscribe((type: ServicePricingType) => {
        const maxCtrl = this.form.get("maximumPrice")!;

        if (type === ServicePricingType.PriceRange) {
          maxCtrl.setValidators([Validators.required, Validators.min(0)]);
        } else {
          maxCtrl.setValidators([Validators.min(0)]);
        }

        maxCtrl.updateValueAndValidity();
      });
  }

  getAttributePlaceholder(attr: AttributeMasterDto): string {
    const type = (attr.dataType || "").toLowerCase();

    switch (type) {
      case "number":
        return attr.unit ? `Enter value in ${attr.unit}` : `Enter ${attr.name}`;

      case "boolean":
        return "Yes / No";

      case "string":
      default:
        return `Enter ${attr.name}`;
    }
  }

  private resolveAttributesForSubCategory(
    subCategoryId: number,
    presetValues?: Map<string, string>
  ): void {
    if (!subCategoryId) {
      this.attributeDefs = [];
      this.attributesArray.clear();
      this.loadingAttributes = false;
      return;
    }

    this.loadingAttributes = true;

    this.businessService
      .getAttributeMasterIds(subCategoryId, EntityType.Service)
      .pipe(
        switchMap((idDefs) => {
          const ids = (idDefs || []).map((d) => d.attributeMasterId);

          if (ids.length === 0) {
            return of([] as AttributeMasterDto[]);
          }

          return this.businessService.getAttributeDetails(ids);
        })
      )
      .subscribe(
        (defs) => {
          this.setAttributeDefs(defs || [], presetValues);

          this.loadingAttributes = false;
        },
        () => {
          this.setAttributeDefs([], presetValues);

          this.loadingAttributes = false;
        }
      );
  }

  private setAttributeDefs(
    defs: AttributeMasterDto[],
    presetValues?: Map<string, string>
  ): void {
    this.attributeDefs = defs;

    this.attributesArray.clear();

    for (const def of defs) {
      const existingValue = presetValues?.get(def.name) || "";

      this.attributesArray.push(
        this.fb.group({
          id: [0],
          serviceAttributeMasterId: [def.attributeMasterId],
          value: [existingValue],
        })
      );
    }
  }

  // ---------- Images ----------

  selectFile(): void {
    document.getElementById("serviceImageUpload")?.click();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    Array.from(input.files).forEach((file) => {
      if (this.images.length >= 10) {
        return;
      }

      const localId = ++this.imgCounter;

      const reader = new FileReader();

      reader.onload = () => {
        this.images.push({
          localId,
          file,
          previewUrl: reader.result as string,
          uploadedUrl: "",
          isPrimary: this.images.length === 0,
          sortOrder: this.images.length + 1,
          uploading: false,
        });
      };

      reader.readAsDataURL(file);
    });

    input.value = "";
  }

  setPrimaryImage(localId: number): void {
    this.images.forEach((img) => (img.isPrimary = img.localId === localId));
  }

  removeImage(localId: number): void {
    this.images = this.images.filter((img) => img.localId !== localId);

    if (this.images.length > 0 && !this.images.some((i) => i.isPrimary)) {
      this.images[0].isPrimary = true;
    }

    this.images.forEach((img, idx) => (img.sortOrder = idx + 1));
  }

  private uploadPendingImages(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pending = this.images.filter((img) => img.file && !img.uploadedUrl);

      if (pending.length === 0) {
        resolve();
        return;
      }

      const formData = new FormData();

      pending.forEach((img) => {
        formData.append("files", img.file as File);

        img.uploading = true;
      });

      this.businessService.uploadServiceImages(formData).subscribe(
        (urls: string[]) => {
          pending.forEach((img, idx) => {
            img.uploadedUrl = urls[idx];

            img.uploading = false;
          });

          resolve();
        },
        (err) => {
          pending.forEach((img) => (img.uploading = false));

          reject(err);
        }
      );
    });
  }

  // ---------- Edit mode ----------

  private patchFromService(s: BusinessServiceDto): void {
    this.loading = true;

    /**
     * Preserve the existing service's subcategory
     * when editing.
     */
    if (s.serviceSubCategoryId) {
      this.serviceSubCategoryId = Number(s.serviceSubCategoryId);
    }

    this.form.patchValue({
      id: s.id,

      serviceName: s.serviceName,

      serviceCategoryId: this.businessCategoryId,

      serviceSubCategoryId: this.serviceSubCategoryId,

      shortDescription: s.shortDescription,

      about: s.about,

      minimumPrice: s.minimumPrice,

      maximumPrice: s.maximumPrice,

      gstIncluded: s.gstIncluded === "Yes",

      serviceArea: s.serviceArea,

      duration: s.duration,

      isBookingRequired: s.isBookingRequired === "Yes",

      isActive: s.isActive,
    });

    this.form
      .get("pricingType")!
      .setValue(
        this.pricingTypeOptions.find((o) => o.label === s.pricingType)?.value ||
          ServicePricingType.FixedPrice
      );

    this.form
      .get("serviceMode")!
      .setValue(
        this.serviceModeOptions.find(
          (o) => o.label.replace(/\s/g, "") === s.serviceMode
        )?.value || ServiceMode.AtBusiness
      );

    this.form
      .get("availability")!
      .setValue(
        this.availabilityOptions.find(
          (o) => o.label.replace(/\s/g, "") === s.availabilityStatus
        )?.value || ServiceAvailabilityStatus.Available
      );

    this.form
      .get("durationUnit")!
      .setValue(
        this.durationUnitOptions.find((o) => o.label.startsWith(s.durationUnit))
          ?.value || ServiceDurationUnit.Hour
      );

    this.images = (s.images || []).map((img, idx) => ({
      localId: ++this.imgCounter,

      previewUrl: img.imageUrl,

      uploadedUrl: img.imageUrl,

      isPrimary: img.isPrimary,

      sortOrder: img.sortOrder || idx + 1,

      uploading: false,
    }));

    const presetValues = new Map<string, string>(
      (s.attributes || []).map((a) => [a.name, a.value])
    );

    this.resolveAttributesForSubCategory(
      this.serviceSubCategoryId,
      presetValues
    );

    this.loading = false;

    this.hydrateAboutEditor();
  }

  // ---------- Section navigation ----------

  get isLastSection(): boolean {
    return (
      this.sections.length > 0 &&
      this.activeSection === this.sections[this.sections.length - 1].id
    );
  }

  goToNextSection(): void {
    const current = this.sections.find((s) => s.id === this.activeSection);

    if (current?.required && !this.isSectionFilled(this.activeSection)) {
      this.errorMessage = `Please complete the ${current.label} section`;

      return;
    }

    this.errorMessage = "";

    const idx = this.sections.findIndex((s) => s.id === this.activeSection);

    if (idx > -1 && idx < this.sections.length - 1) {
      this.setSection(this.sections[idx + 1].id);
    }
  }

  goToPreviousSection(): void {
    const idx = this.sections.findIndex((s) => s.id === this.activeSection);

    if (idx > 0) {
      this.setSection(this.sections[idx - 1].id);
    }
  }

  // ---------- Tab completion ----------

  isSectionFilled(id: SectionId): boolean {
    switch (id) {
      case "basic":
        return !!this.form.get("serviceName")?.valid;

      case "attributes":
        return this.attributesArray.controls.some(
          (c) => !!c.get("value")?.value
        );

      case "pricing": {
        const priceCtrl = this.form.get("minimumPrice");

        return !!(
          priceCtrl?.valid &&
          priceCtrl?.value !== null &&
          priceCtrl?.value !== ""
        );
      }

      case "details":
        return !!(
          this.form.get("serviceArea")?.value ||
          this.form.get("duration")?.value ||
          this.form.get("isBookingRequired")?.value
        );

      case "images":
        return this.images.length > 0;

      default:
        return false;
    }
  }

  // ---------- Save ----------

  async onSave(): Promise<void> {
    this.errorMessage = "";

    /**
     * Make sure the internal subcategory
     * is available before calling the API.
     */
    if (!this.serviceSubCategoryId) {
      this.errorMessage = "Unable to determine the service category.";

      return;
    }

    /**
     * Keep the hidden form control synchronized.
     */
    this.form.get("serviceSubCategoryId")?.setValue(this.serviceSubCategoryId);

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.errorMessage = "Please fill in all required fields.";

      return;
    }

    if (this.images.length === 0) {
      this.errorMessage = "Please add at least one service image.";

      this.activeSection = "images";

      return;
    }

    this.saving = true;

    try {
      await this.uploadPendingImages();
    } catch {
      this.saving = false;

      this.errorMessage =
        "One or more images failed to upload. Please try again.";

      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      id: raw.id,

      businessId: this.businessId,

      serviceCategoryId: this.businessCategoryId,

      /**
       * API still receives ONE subcategory.
       *
       * This value is completely internal
       * and is not shown in the UI.
       */
      serviceSubCategoryId: this.serviceSubCategoryId,

      serviceName: raw.serviceName,

      shortDescription: raw.shortDescription,

      about: raw.about,

      minimumPrice: raw.minimumPrice,

      maximumPrice: raw.maximumPrice,

      pricingType: raw.pricingType,

      gstIncluded: raw.gstIncluded,

      serviceMode: raw.serviceMode,

      serviceArea: raw.serviceArea,

      duration: raw.duration,

      durationUnit: raw.durationUnit,

      isBookingRequired: raw.isBookingRequired,

      availability: raw.availability,

      isActive: raw.isActive,

      attributes: raw.attributes.map((a: any) => ({
        id: a.id,
        businessServiceId: raw.id,
        serviceAttributeMasterId: a.serviceAttributeMasterId,
        value: a.value,
      })),

      images: this.images.map((img) => ({
        id: 0,
        businessServiceId: raw.id,
        imageUrl: img.uploadedUrl,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    };

    this.businessService.saveService(payload as any).subscribe(
      () => {
        this.saving = false;

        this.showNotification("Service Added Successfully");

        this.saved.emit();
      },
      () => {
        this.saving = false;

        this.showNotification("Failed to save service. Please try again.");

        this.errorMessage = "Failed to save service. Please try again.";
      }
    );
  }

  dismiss(): void {
    this.close.emit();
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }
}
