import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BusinessService } from '../../service/business.service';
import { BusinessProductDto, AttributeMasterDto } from '../../model/Business';
import {
  PRICE_UNIT_OPTIONS,
  PRODUCT_CONDITION_OPTIONS,
  AVAILABILITY_STATUS_OPTIONS,
  WARRANTY_PERIOD_UNIT_OPTIONS,
  PriceUnit,
  ProductCondition,
  ProductAvailabilityStatus,
  WarrantyPeriodUnit,
  EntityType,
} from './../../enum/business-product.enum';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ProductImagePreview {
  localId: number;
  file?: File;
  previewUrl: string;
  uploadedUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  uploading: boolean;
}

type SectionId = 'basic' | 'attributes' | 'pricing' | 'delivery' | 'images';

@Component({
  selector: 'app-add-business-product',
  templateUrl: './add-business-product.component.html',
  styleUrls: ['./add-business-product.component.css'],
})
export class AddBusinessProductComponent implements OnInit, AfterViewInit {
  @Input() businessId!: number;
  @Input() businessCategoryId!: number;

  // Business can have multiple subcategories.
  // Product API still requires only ONE subcategory ID.
  // This value is used internally and is NOT displayed to the user.
  @Input() businessSubCategories: any[] = [];

  @Input() selectedSubCategoryId: number | null = null;

  @Input() product: BusinessProductDto | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  @ViewChild('aboutEditor')
  aboutEditorRef?: ElementRef<HTMLDivElement>;

  form!: FormGroup;

  loading = false;
  saving = false;
  errorMessage = '';

  activeSection: SectionId = 'basic';

  sections: {
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
    {
      id: 'attributes',
      label: 'Attributes',
      icon: 'tune',
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: 'sell',
      required: true,
    },
    {
      id: 'delivery',
      label: 'Delivery & Warranty',
      icon: 'local_shipping',
    },
    {
      id: 'images',
      label: 'Images',
      icon: 'photo_library',
      required: true,
    },
  ];

  attributeDefs: AttributeMasterDto[] = [];

  priceUnitOptions = PRICE_UNIT_OPTIONS;
  conditionOptions = PRODUCT_CONDITION_OPTIONS;
  availabilityOptions = AVAILABILITY_STATUS_OPTIONS;
  warrantyPeriodOptions = WARRANTY_PERIOD_UNIT_OPTIONS;

  images: ProductImagePreview[] = [];

  private imgCounter = 0;

  loadingAttributes = false;

  /**
   * Product subcategory is intentionally NOT shown to the user.
   *
   * For an existing product:
   * use the product's existing productSubCategoryId.
   *
   * For a new product:
   * use the first business subcategory internally.
   */
  private productSubCategoryId = 0;

  get isEditMode(): boolean {
    return !!this.product?.id;
  }

  get attributesArray(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Determine the internal product subcategory first.
    this.setInternalProductSubCategoryId();

    this.buildForm();

    this.activeSection = 'basic';

    if (this.product) {
      this.patchFromProduct(this.product);
    } else {
      this.resolveAttributesForSubCategory(this.productSubCategoryId);
    }
  }

  ngAfterViewInit(): void {
    this.hydrateAboutEditor();
  }

  /**
   * Determines the single subcategory that will be sent
   * to the existing Product API.
   *
   * It is completely hidden from the user.
   */
  private setInternalProductSubCategoryId(): void {
    // Edit mode: always preserve the product's existing subcategory.
    if (this.product?.productSubCategoryId) {
      this.productSubCategoryId = this.product.productSubCategoryId;
      return;
    }

    // Add mode: use the sub-category tab currently selected on the
    // business profile page.
    if (this.selectedSubCategoryId !== null) {
      this.productSubCategoryId = Number(this.selectedSubCategoryId) || 0;
      return;
    }

    // Fallback for the rare case no tab is selected (e.g. zero
    // subcategories on the business).
    if (this.businessSubCategories && this.businessSubCategories.length > 0) {
      this.productSubCategoryId = Number(this.businessSubCategories[0]) || 0;
      return;
    }

    this.productSubCategoryId = 0;
  }

  setSection(id: SectionId): void {
    this.activeSection = id;

    if (id === 'basic') {
      this.hydrateAboutEditor();
    }
  }

  private hydrateAboutEditor(): void {
    setTimeout(() => {
      if (this.aboutEditorRef) {
        this.aboutEditorRef.nativeElement.innerHTML =
          this.form.get('about')?.value || '';
      }
    });
  }

  exec(command: string, value: string = ''): void {
    document.execCommand(command, false, value);

    this.aboutEditorRef?.nativeElement.focus();

    if (this.aboutEditorRef) {
      this.onAboutInput(this.aboutEditorRef.nativeElement);
    }
  }

  insertLink(): void {
    const url = window.prompt('Enter a URL');

    if (url) {
      this.exec('createLink', url);
    }
  }

  onAboutInput(el: HTMLDivElement): void {
    this.form.get('about')?.setValue(el.innerHTML);
  }

  private defaultValue() {
    return {
      id: 0,
      name: '',
      shortDescription: '',
      about: '',
      price: null,
      discountPercentage: 0,
      priceOnRequest: false,
      gst: 0,
      priceUnit: PriceUnit.Piece,
      condition: ProductCondition.New,
      availabilityStatus: ProductAvailabilityStatus.InStock,
      deliveryAvailable: false,
      shippingCharges: 0,
      freeShipping: false,
      warrantyAvailable: false,
      warrantyDuration: 0,
      warrantyPeriodUnit: WarrantyPeriodUnit.Month,
      warrantyDescription: '',
      returnPolicy: '',
    };
  }

  private buildForm(): void {
    const v = this.defaultValue();

    this.form = this.fb.group({
      id: [v.id],

      name: [v.name, [Validators.required, Validators.maxLength(150)]],

      productCategoryId: [this.businessCategoryId, Validators.required],

      /**
       * Internal only.
       *
       * There should be NO HTML control for this field.
       * It is still required because the API requires it.
       */
      productSubCategoryId: [this.productSubCategoryId, Validators.required],

      shortDescription: [v.shortDescription, Validators.maxLength(250)],

      about: [v.about],

      price: [v.price],

      discountPercentage: [
        v.discountPercentage,
        [Validators.min(0), Validators.max(100)],
      ],

      priceOnRequest: [v.priceOnRequest],

      gst: [v.gst, [Validators.min(0), Validators.max(100)]],

      priceUnit: [v.priceUnit, Validators.required],

      condition: [v.condition, Validators.required],

      availabilityStatus: [v.availabilityStatus, Validators.required],

      deliveryAvailable: [v.deliveryAvailable],

      shippingCharges: [v.shippingCharges, Validators.min(0)],

      freeShipping: [v.freeShipping],

      warrantyAvailable: [v.warrantyAvailable],

      warrantyDuration: [v.warrantyDuration, Validators.min(0)],

      warrantyPeriodUnit: [v.warrantyPeriodUnit],

      warrantyDescription: [v.warrantyDescription],

      returnPolicy: [v.returnPolicy],

      attributes: this.fb.array([]),
    });

    this.form
      .get('priceOnRequest')!
      .valueChanges.subscribe((onRequest: boolean) => {
        const priceCtrl = this.form.get('price')!;

        if (onRequest) {
          priceCtrl.clearValidators();
        } else {
          priceCtrl.setValidators([Validators.required, Validators.min(0)]);
        }

        priceCtrl.updateValueAndValidity();
      });
  }

  getAttributePlaceholder(attr: AttributeMasterDto): string {
    const type = (attr.dataType || '').toLowerCase();

    switch (type) {
      case 'number':
        return attr.unit ? `Enter value in ${attr.unit}` : `Enter ${attr.name}`;

      case 'boolean':
        return 'Yes / No';

      case 'string':
      default:
        return `Enter ${attr.name}`;
    }
  }

  /**
   * Loads attributes based on the internally selected
   * product subcategory.
   */
  private resolveAttributesForSubCategory(
    subCategoryId: number,
    presetValues?: Map<string, string>,
  ): void {
    if (!subCategoryId) {
      this.attributeDefs = [];
      this.attributesArray.clear();
      this.loadingAttributes = false;
      return;
    }

    this.loadingAttributes = true;

    this.businessService
      .getAttributeMasterIds(subCategoryId, EntityType.Product)
      .pipe(
        switchMap((idDefs) => {
          const ids = (idDefs || []).map((d) => d.attributeMasterId);

          if (ids.length === 0) {
            return of([] as AttributeMasterDto[]);
          }

          return this.businessService.getAttributeDetails(ids);
        }),
      )
      .subscribe(
        (defs) => {
          this.setAttributeDefs(defs || [], presetValues);

          this.loadingAttributes = false;
        },
        () => {
          this.setAttributeDefs([], presetValues);
          this.loadingAttributes = false;
        },
      );
  }

  private setAttributeDefs(
    defs: AttributeMasterDto[],
    presetValues?: Map<string, string>,
  ): void {
    this.attributeDefs = defs;

    this.attributesArray.clear();

    for (const def of defs) {
      const existingValue = presetValues?.get(def.name) || '';

      this.attributesArray.push(
        this.fb.group({
          id: [0],
          productAttributeMasterId: [def.attributeMasterId],
          value: [existingValue],
        }),
      );
    }
  }

  selectFile(): void {
    document.getElementById('productImageUpload')?.click();
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
          uploadedUrl: '',
          isPrimary: this.images.length === 0,
          sortOrder: this.images.length + 1,
          uploading: false,
        });
      };

      reader.readAsDataURL(file);
    });

    input.value = '';
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
        formData.append('files', img.file as File);
        img.uploading = true;
      });

      this.businessService.uploadProductImages(formData).subscribe(
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
        },
      );
    });
  }

  private patchFromProduct(p: BusinessProductDto): void {
    this.loading = true;

    /**
     * For edit mode, ALWAYS use the existing product's
     * subcategory ID.
     */
    if (p.productSubCategoryId) {
      this.productSubCategoryId = Number(p.productSubCategoryId);
    }

    this.form.patchValue({
      id: p.id,
      name: p.name,

      productCategoryId: this.businessCategoryId,

      // Internal value only.
      productSubCategoryId: this.productSubCategoryId,

      shortDescription: p.shortDescription,
      about: p.about,
      price: p.price,
      discountPercentage: p.discountPercentage,
      priceOnRequest: p.priceOnRequest === 'Yes',
      gst: p.gst,
      deliveryAvailable: p.deliveryAvailable === 'Yes',
      shippingCharges: p.shippingCharges,
      freeShipping: p.freeShipping === 'Yes',
      warrantyAvailable: p.warrantyAvailable === 'Yes',
      warrantyDuration: p.warrantyDuration,
      warrantyDescription: p.warrantyDescription,
      returnPolicy: p.returnPolicy,
    });

    this.form
      .get('priceUnit')!
      .setValue(
        this.priceUnitOptions.find((o) => o.label === p.priceUnit)?.value ||
          PriceUnit.Piece,
      );

    this.form
      .get('condition')!
      .setValue(
        this.conditionOptions.find((o) => o.label === p.condition)?.value ||
          ProductCondition.New,
      );

    this.form
      .get('availabilityStatus')!
      .setValue(
        this.availabilityOptions.find(
          (o) => o.label.replace(/\s/g, '') === p.availabilityStatus,
        )?.value || ProductAvailabilityStatus.InStock,
      );

    this.form
      .get('warrantyPeriodUnit')!
      .setValue(
        this.warrantyPeriodOptions.find((o) =>
          o.label.startsWith(p.warrantyPeriodUnit),
        )?.value || WarrantyPeriodUnit.Month,
      );

    this.images = (p.images || []).map((img, idx) => ({
      localId: ++this.imgCounter,
      previewUrl: img.imageUrl,
      uploadedUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder || idx + 1,
      uploading: false,
    }));

    const presetValues = new Map<string, string>(
      (p.attributes || []).map((a) => [a.name, a.value]),
    );

    this.resolveAttributesForSubCategory(
      this.productSubCategoryId,
      presetValues,
    );

    this.loading = false;

    this.hydrateAboutEditor();
  }

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

    this.errorMessage = '';

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

  isSectionFilled(id: SectionId): boolean {
    switch (id) {
      case 'basic':
        return !!this.form.get('name')?.valid;

      case 'attributes':
        return this.attributesArray.controls.some(
          (c) => !!c.get('value')?.value,
        );

      case 'pricing': {
        const priceOnRequest = this.form.get('priceOnRequest')?.value;

        const priceCtrl = this.form.get('price');

        return !!(
          priceOnRequest ||
          (priceCtrl?.valid &&
            priceCtrl?.value !== null &&
            priceCtrl?.value !== '')
        );
      }

      case 'delivery':
        return !!(
          this.form.get('deliveryAvailable')?.value ||
          this.form.get('warrantyAvailable')?.value ||
          this.form.get('returnPolicy')?.value
        );

      case 'images':
        return this.images.length > 0;

      default:
        return false;
    }
  }

  async onSave(): Promise<void> {
    this.errorMessage = '';

    /**
     * Make absolutely sure the internal subcategory exists.
     */
    if (!this.productSubCategoryId) {
      this.errorMessage = 'Unable to determine the product category.';
      return;
    }

    /**
     * Keep the internal form value synchronized.
     */
    this.form.get('productSubCategoryId')?.setValue(this.productSubCategoryId);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.images.length === 0) {
      this.errorMessage = 'Please add at least one product image.';
      this.activeSection = 'images';
      return;
    }

    this.saving = true;

    try {
      await this.uploadPendingImages();
    } catch {
      this.saving = false;

      this.errorMessage =
        'One or more images failed to upload. Please try again.';

      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      id: raw.id,

      businessId: this.businessId,

      name: raw.name,

      productCategoryId: this.businessCategoryId,

      /**
       * Existing API still receives ONE subcategory ID.
       * This is NOT visible in the UI.
       */
      productSubCategoryId: this.productSubCategoryId,

      shortDescription: raw.shortDescription,

      about: raw.about,

      price: raw.priceOnRequest ? 0 : raw.price,

      discountPercentage: raw.discountPercentage,

      priceOnRequest: raw.priceOnRequest,

      gst: raw.gst,

      priceUnit: raw.priceUnit,

      condition: raw.condition,

      availabilityStatus: raw.availabilityStatus,

      deliveryAvailable: raw.deliveryAvailable,

      shippingCharges: raw.shippingCharges,

      freeShipping: raw.freeShipping,

      warrantyAvailable: raw.warrantyAvailable,

      warrantyDuration: raw.warrantyDuration,

      warrantyPeriodUnit: raw.warrantyPeriodUnit,

      warrantyDescription: raw.warrantyDescription,

      returnPolicy: raw.returnPolicy,

      attributes: raw.attributes.map((a: any) => ({
        id: a.id,
        businessProductId: raw.id,
        productAttributeMasterId: a.productAttributeMasterId,
        value: a.value,
      })),

      images: this.images.map((img) => ({
        id: 0,
        businessProductId: raw.id,
        imageUrl: img.uploadedUrl,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    };

    this.businessService.saveProduct(payload as any).subscribe(
      () => {
        this.saving = false;

        this.showNotification('Product Added Successfully');

        this.saved.emit();
      },
      () => {
        this.saving = false;

        this.showNotification('Failed to save product. Please try again.');

        this.errorMessage = 'Failed to save product. Please try again.';
      },
    );
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
