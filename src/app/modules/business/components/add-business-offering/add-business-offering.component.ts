import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BusinessService } from "../../service/business.service";
import {

} from "../../model/Business";
import {
  BusinessOfferingDto,
  OfferingCourseDto,
  OfferingMedicalServiceDto,
  OFFERING_TYPE_OPTIONS,
  SUPPORTED_OFFERING_TYPES,
} from "../../model/Business";
import { OfferingType } from "../../enum/business-offering.enum";

type SectionId = "type" | "basic" | "details" | "image";

@Component({
  selector: "app-add-business-offering",
  templateUrl: "./add-business-offering.component.html",
  styleUrls: ["./add-business-offering.component.css"],
})
export class AddBusinessOfferingComponent implements OnInit {
  @Input() businessId!: number;

  @ViewChild("descriptionEditor") descriptionEditorRef?: ElementRef<HTMLDivElement>;

  // Same idea as AddBusinessProductComponent: business can have multiple
  // subcategories, we quietly use the first one internally.
  @Input() businessSubCategories: any[] = [];

  @Input() offering: BusinessOfferingDto | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  @ViewChild("imageInputRef") imageInputRef?: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  courseForm!: FormGroup;
  medicalForm!: FormGroup;

  loading = false;
  saving = false;
  errorMessage = "";

  activeSection: SectionId = "type";

  offeringTypeOptions = OFFERING_TYPE_OPTIONS;
  OfferingType = OfferingType;

  imagePreviewUrl = "";
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
        return "Course Details";
      case OfferingType.MedicalService:
        return "Medical Service Details";
      default:
        return "Details";
    }
  }

  get sections(): {
    id: SectionId;
    label: string;
    icon: string;
    required?: boolean;
  }[] {
    return [
      { id: "type", label: "Offering Type", icon: "category", required: true },
      { id: "basic", label: "Basic Details", icon: "storefront", required: true },
      { id: "details", label: this.detailsSectionLabel, icon: "tune" },
      { id: "image", label: "Image", icon: "photo_library", required: true },
    ];
  }

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForms();

    if (this.offering) {
      this.patchFromOffering(this.offering);
    } else {
      const defaultSubCategoryId =
        this.businessSubCategories && this.businessSubCategories.length > 0
          ? Number(this.businessSubCategories[0]) || 0
          : 0;
      this.form.patchValue({ subCategoryId: defaultSubCategoryId });
    }
  }

  private buildForms(): void {
    this.form = this.fb.group({
      id: [0],
      offeringType: [null, Validators.required],
      subCategoryId: [0, Validators.required],
      name: ["", [Validators.required, Validators.maxLength(150)]],
      description: [""],
      price: [null, [Validators.required, Validators.min(0)]],
      isActive: [true],
      displayOrder: [0],
    });

    this.courseForm = this.fb.group({
      id: [0],
      courseType: [""],
      courseCategory: [""],
      courseLevel: [""],
      duration: [0],
      durationUnit: [""],
      modeOfLearning: [""],
      classSchedule: [""],
      startDate: [null],
      endDate: [null],
      eligibility: [""],
      ageGroup: [""],
      language: [""],
      curriculum: [""],
      subjectsCovered: [""],
      certification: [""],
      accreditation: [""],
      instructorName: [""],
      instituteName: [""],
      batchSize: [0],
      feeFrequency: [""],
      registrationFee: [0],
      discount: [0],
      scholarshipAvailable: [false],
      studyMaterialIncluded: [false],
      examIncluded: [false],
      placementAssistance: [false],
      internshipAvailable: [false],
      courseHighlights: [""],
    });

    this.medicalForm = this.fb.group({
      id: [0],
      serviceType: [""],
      medicalSpecialty: [""],
      department: [""],
      doctorName: [""],
      qualification: [""],
      experience: [0],
      gender: [""],
      serviceMode: [""],
      consultationType: [""],
      followUpFee: [0],
      appointmentRequired: [false],
      emergencyService: [false],
      homeVisitAvailable: [false],
      teleconsultationAvailable: [false],
      serviceDuration: [0],
      serviceDurationUnit: [""],
      availableDays: [""],
      availableTime: [""],
      insuranceAccepted: [false],
      cashlessAvailable: [false],
      labFacility: [false],
      pharmacyAvailable: [false],
      ambulanceAvailable: [false],
      ageGroup: [""],
      conditionsTreated: [""],
      procedures: [""],
      serviceHighlights: [""],
    });
  }

  setSection(id: SectionId): void {
    this.activeSection = id;

    if (id === "basic") {
      setTimeout(() => {
        if (this.descriptionEditorRef) {
          this.descriptionEditorRef.nativeElement.innerHTML =
            this.form.get("description")?.value || "";
        }
      });
    }
  }

  get isLastSection(): boolean {
    return this.activeSection === "image";
  }

  goToNextSection(): void {
    const order: SectionId[] = ["type", "basic", "details", "image"];
    const current = this.sections.find((s) => s.id === this.activeSection);

    if (current?.required && !this.isSectionFilled(this.activeSection)) {
      this.errorMessage = `Please complete the ${current.label} section`;
      return;
    }

    this.errorMessage = "";

    const idx = order.indexOf(this.activeSection);
    if (idx > -1 && idx < order.length - 1) {
      this.setSection(order[idx + 1]);
    }
  }

  exec(command: string, value: string = ""): void {
    document.execCommand(command, false, value);
    this.descriptionEditorRef?.nativeElement.focus();
    if (this.descriptionEditorRef) {
      this.onDescriptionInput(this.descriptionEditorRef.nativeElement);
    }
  }

  insertLink(): void {
    const url = window.prompt("Enter a URL");
    if (url) {
      this.exec("createLink", url);
    }
  }

  onDescriptionInput(el: HTMLDivElement): void {
    this.form.patchValue({ description: el.innerHTML });
  }

  isSectionFilled(id: SectionId): boolean {
    switch (id) {
      case "type":
        return !!this.form.get("offeringType")?.valid;
      case "basic":
        return (
          !!this.form.get("name")?.valid && !!this.form.get("price")?.valid
        );
      case "details":
        // Type-specific fields are supplementary, not blocking.
        return true;
      case "image":
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
    input.value = "";
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreviewUrl = "";
  }

  private uploadImageIfNeeded(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.imageFile) {
        // Already-hosted URL from edit mode (not a fresh base64 preview).
        resolve(
          this.imagePreviewUrl && !this.imagePreviewUrl.startsWith("data:")
            ? this.imagePreviewUrl
            : ""
        );
        return;
      }

      const formData = new FormData();
      formData.append("files", this.imageFile);
      this.imageUploading = true;

      // Reuses the existing product-image upload endpoint. Swap this for a
      // dedicated offering-image endpoint if/when one is added.
      this.businessService.uploadProductImages(formData).subscribe(
        (urls: string[]) => {
          this.imageUploading = false;
          resolve(urls[0] || "");
        },
        (err) => {
          this.imageUploading = false;
          reject(err);
        }
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

    // Offering type can't be changed once the offering (and its detail
    // record) already exist.
    this.form.get("offeringType")?.disable();

    this.imagePreviewUrl = o.imageUrl || "";

    if (o.offeringType === OfferingType.Course) {
      this.businessService.getOfferingCourse(o.id).subscribe(
        (detail) => detail && this.courseForm.patchValue(detail),
        () => {}
      );
    } else if (o.offeringType === OfferingType.MedicalService) {
      this.businessService.getOfferingMedicalService(o.id).subscribe(
        (detail) => detail && this.medicalForm.patchValue(detail),
        () => {}
      );
    }

    this.loading = false;
  }

  // ---------- Save ----------

  async onSave(): Promise<void> {
    this.errorMessage = "";

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = "Please fill in all required fields.";
      this.activeSection = "basic";
      return;
    }

    if (!this.imagePreviewUrl) {
      this.errorMessage = "Please add an image for this offering.";
      this.activeSection = "image";
      return;
    }

    this.saving = true;

    let uploadedImageUrl = "";
    try {
      uploadedImageUrl = await this.uploadImageIfNeeded();
    } catch {
      this.saving = false;
      this.errorMessage = "Image upload failed. Please try again.";
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
      () => {
        this.saving = false;
        this.errorMessage = "Failed to save offering. Please try again.";
      }
    );
  }

  private saveTypeSpecificDetail(
    businessOfferingId: number,
    offeringType: OfferingType
  ): void {
    if (offeringType === OfferingType.Course) {
      const coursePayload: OfferingCourseDto = {
        ...this.courseForm.getRawValue(),
        businessOfferingId,
        businessId: this.businessId,
      };

      this.businessService
        .saveOfferingCourse(coursePayload)
        .subscribe(
          () => this.finishSave(),
          () => this.finishSaveWithWarning()
        );
    } else if (offeringType === OfferingType.MedicalService) {
      const medicalPayload: OfferingMedicalServiceDto = {
        ...this.medicalForm.getRawValue(),
        businessOfferingId,
        businessId: this.businessId,
      };

      this.businessService
        .saveOfferingMedicalService(medicalPayload)
        .subscribe(
          () => this.finishSave(),
          () => this.finishSaveWithWarning()
        );
    } else {
      // No detail API available yet for this offering type - the common
      // record is already saved, so treat this as a success.
      this.finishSave();
    }
  }

  private finishSave(): void {
    this.saving = false;
    this.showNotification(
      this.isEditMode
        ? "Offering updated successfully"
        : "Offering added successfully"
    );
    this.saved.emit();
  }

  private finishSaveWithWarning(): void {
    this.saving = false;
    this.showNotification(
      "Offering saved, but its details failed to save. Please edit and try again."
    );
    this.saved.emit();
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