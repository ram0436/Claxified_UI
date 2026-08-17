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
  ServiceAttributeMasterDto,
  BusinessServiceDto,
  ServicePricingType,
  ServiceMode,
  ServiceAvailabilityStatus,
  ServiceDurationUnit,
  SERVICE_PRICING_TYPE_OPTIONS,
  SERVICE_MODE_OPTIONS,
  SERVICE_AVAILABILITY_STATUS_OPTIONS,
  SERVICE_DURATION_UNIT_OPTIONS,
} from "../../model/Business";
import { MatSnackBar } from "@angular/material/snack-bar";

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
  @Input() businessSubCategoryId!: number;
  @Input() service: BusinessServiceDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  @ViewChild("aboutEditor") aboutEditorRef?: ElementRef<HTMLDivElement>;

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
    { id: "basic", label: "Basic Details", icon: "storefront", required: true },
    { id: "attributes", label: "Attributes", icon: "tune" },
    { id: "pricing", label: "Pricing", icon: "sell", required: true },
    { id: "details", label: "Service Details", icon: "design_services" },
    { id: "images", label: "Images", icon: "photo_library", required: true },
  ];

  attributeDefs: ServiceAttributeMasterDto[] = [];

  pricingTypeOptions = SERVICE_PRICING_TYPE_OPTIONS;
  serviceModeOptions = SERVICE_MODE_OPTIONS;
  availabilityOptions = SERVICE_AVAILABILITY_STATUS_OPTIONS;
  durationUnitOptions = SERVICE_DURATION_UNIT_OPTIONS;

  images: ServiceImagePreview[] = [];
  private imgCounter = 0;

  loadingAttributes = false;

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
    this.buildForm();
    this.activeSection = "basic";

    if (this.service) {
      this.patchFromService(this.service);
    } else {
      this.resolveAttributesForSubCategory(this.businessSubCategoryId);
    }
  }

  ngAfterViewInit(): void {
    // "About Service" lives on the default ("basic") section, so it's
    // already in the DOM on first render — hydrate it once the view
    // (and any synchronous form patch from ngOnInit) is ready.
    this.hydrateAboutEditor();
  }

  setSection(id: SectionId): void {
    this.activeSection = id;

    // contenteditable divs are recreated by *ngIf, so re-hydrate content
    // with the form value whenever the Basic Details tab (which hosts the
    // About Service editor) is opened
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
      // Set once from the parent-supplied business category/sub-category.
      // No longer user-editable, so no cascading valueChanges needed.
      serviceCategoryId: [this.businessCategoryId, Validators.required],
      serviceSubCategoryId: [this.businessSubCategoryId, Validators.required],
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

  private resolveAttributesForSubCategory(
    subCategoryId: number,
    presetValues?: Map<string, string>
  ): void {
    this.loadingAttributes = true;
    this.businessService
      .getServiceAttributeMasterIds(subCategoryId)
      .pipe(
        switchMap((masterIds) => {
          if (!masterIds || masterIds.length === 0) {
            return of([] as ServiceAttributeMasterDto[]);
          }
          return this.businessService.getServiceAttributes(masterIds);
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
    defs: ServiceAttributeMasterDto[],
    presetValues?: Map<string, string>
  ): void {
    this.attributeDefs = defs;
    this.attributesArray.clear();

    for (const def of defs) {
      const existingValue = presetValues?.get(def.name) || "";
      this.attributesArray.push(
        this.fb.group({
          id: [0],
          serviceAttributeMasterId: [def.serviceAttributeMasterId],
          value: [existingValue],
        })
      );
    }
  }

  // ---------- Images (mirrors the product image upload UX) ----------

  selectFile(): void {
    document.getElementById("serviceImageUpload")?.click();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      if (this.images.length >= 10) return;
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

    this.form.patchValue({
      id: s.id,
      serviceName: s.serviceName,
      serviceCategoryId: this.businessCategoryId,
      serviceSubCategoryId: this.businessSubCategoryId,
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
      this.businessSubCategoryId,
      presetValues
    );
    this.loading = false;
    this.hydrateAboutEditor();
  }

  // ---------- Section navigation (Save & Continue) ----------

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

  // ---------- Tab completion status (used for the green tick / pending icon) ----------

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
      serviceCategoryId: raw.serviceCategoryId,
      serviceSubCategoryId: raw.serviceSubCategoryId,
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
