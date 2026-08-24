import { Component, OnInit } from "@angular/core";
import { BusinessService } from "../../service/business.service";
import { EntityType } from "../../enum/business-product.enum";
import {
  ProductCategoryDto,
  ProductSubCategoryDto,
  AttributeMasterListItem,
} from "../../model/Business";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-business-attribute-mapping",
  templateUrl: "./business-attribute-mapping.component.html",
  styleUrls: ["./business-attribute-mapping.component.css"],
})
export class BusinessAttributeMappingComponent implements OnInit {
  EntityType = EntityType;

  categories: ProductCategoryDto[] = [];
  subCategories: ProductSubCategoryDto[] = [];
  allAttributes: AttributeMasterListItem[] = [];

  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  activeEntityTab: EntityType = EntityType.Product;

  productSelection = new Set<number>();
  serviceSelection = new Set<number>();

  // Frozen, ordered lists — selected-first — recomputed only on load/tab-switch
  productOrdered: AttributeMasterListItem[] = [];
  serviceOrdered: AttributeMasterListItem[] = [];

  loadingCategories = false;
  loadingSubCategories = false;
  loadingAttributes = false;
  loadingMapping = false;
  saving = false;

  searchTerm = "";
  saveMessage = "";
  saveError = "";

  constructor(
    private businessService: BusinessService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAttributeMaster();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.businessService.getProductCategories().subscribe({
      next: (res) => {
        this.categories = res || [];
        this.loadingCategories = false;
      },
      error: () => (this.loadingCategories = false),
    });
  }

  loadAttributeMaster(): void {
    this.loadingAttributes = true;
    this.businessService.getAttributeMasterList().subscribe({
      next: (res) => {
        this.allAttributes = res || [];
        this.loadingAttributes = false;
        this.rebuildOrder(EntityType.Product);
        this.rebuildOrder(EntityType.Service);
      },
      error: () => (this.loadingAttributes = false),
    });
  }

  onCategoryChange(categoryId: number | string): void {
    const id = Number(categoryId);
    this.selectedCategoryId = id || null;
    this.selectedSubCategoryId = null;
    this.subCategories = [];
    this.productSelection.clear();
    this.serviceSelection.clear();
    this.rebuildOrder(EntityType.Product);
    this.rebuildOrder(EntityType.Service);
    this.saveMessage = "";
    this.saveError = "";
    if (!id) return;

    this.loadingSubCategories = true;
    this.businessService.getProductSubCategories(id).subscribe({
      next: (res) => {
        this.subCategories = res || [];
        this.loadingSubCategories = false;
      },
      error: () => (this.loadingSubCategories = false),
    });
  }

  onSubCategoryChange(subCategoryId: number | string): void {
    const id = Number(subCategoryId);
    this.selectedSubCategoryId = id || null;
    this.productSelection.clear();
    this.serviceSelection.clear();
    this.saveMessage = "";
    this.saveError = "";
    if (!id) {
      this.rebuildOrder(EntityType.Product);
      this.rebuildOrder(EntityType.Service);
      return;
    }

    this.loadExistingMapping(EntityType.Product, this.productSelection);
    this.loadExistingMapping(EntityType.Service, this.serviceSelection);
  }

  private loadExistingMapping(
    entityType: EntityType,
    target: Set<number>
  ): void {
    if (!this.selectedSubCategoryId) return;
    this.loadingMapping = true;
    this.businessService
      .getCategoryAttributeMapping(this.selectedSubCategoryId, entityType)
      .subscribe({
        next: (res) => {
          target.clear();
          const ids = this.extractAttributeIds(res);

          ids.forEach((id) => target.add(id));
          this.loadingMapping = false;
          this.rebuildOrder(entityType);
        },
        error: (err) => {
          target.clear();
          this.loadingMapping = false;
          this.rebuildOrder(entityType);
        },
      });
  }

  private extractAttributeIds(res: any): number[] {
    if (!res) return [];

    if (Array.isArray(res.attributeMasterIds)) {
      return res.attributeMasterIds
        .map((v: any) => Number(v))
        .filter((v: number) => !isNaN(v));
    }

    if (Array.isArray(res)) {
      return res
        .map((item: any) => {
          if (typeof item === "number") return item;
          if (typeof item === "string") return Number(item);
          if (item && typeof item === "object") {
            const raw =
              item.attributeMasterId ??
              item.attributeMasterID ??
              item.attributeId ??
              item.id;
            return raw != null ? Number(raw) : NaN;
          }
          return NaN;
        })
        .filter((v: number) => !isNaN(v));
    }

    return [];
  }

  setActiveTab(entityType: EntityType): void {
    this.activeEntityTab = entityType;
    this.saveMessage = "";
    this.saveError = "";
  }

  get activeSelection(): Set<number> {
    return this.activeEntityTab === EntityType.Product
      ? this.productSelection
      : this.serviceSelection;
  }

  get activeOrdered(): AttributeMasterListItem[] {
    return this.activeEntityTab === EntityType.Product
      ? this.productOrdered
      : this.serviceOrdered;
  }

  isChecked(attributeId: number): boolean {
    return this.activeSelection.has(attributeId);
  }

  toggleAttribute(attributeId: number): void {
    const set = this.activeSelection;
    if (set.has(attributeId)) {
      set.delete(attributeId);
    } else {
      set.add(attributeId);
    }
    // Order intentionally NOT rebuilt here — list stays stable while
    // checking/unchecking. It re-sorts next time this subcategory/tab loads.
  }

  /** Selected-first, frozen order for the given entity type. */
  private rebuildOrder(entityType: EntityType): void {
    const selection =
      entityType === EntityType.Product
        ? this.productSelection
        : this.serviceSelection;

    const selected: AttributeMasterListItem[] = [];
    const unselected: AttributeMasterListItem[] = [];
    for (const attr of this.allAttributes) {
      if (selection.has(attr.id)) {
        selected.push(attr);
      } else {
        unselected.push(attr);
      }
    }
    const ordered = [...selected, ...unselected];

    if (entityType === EntityType.Product) {
      this.productOrdered = ordered;
    } else {
      this.serviceOrdered = ordered;
    }
  }

  trackByAttrId(_index: number, attr: AttributeMasterListItem): number {
    return attr.id;
  }

  /** Search filter applied on top of the frozen order. */
  get displayedAttributes(): AttributeMasterListItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.activeOrdered;
    return this.activeOrdered.filter((a) =>
      a.name.toLowerCase().includes(term)
    );
  }

  saveMapping(): void {
    if (!this.selectedSubCategoryId) return;
    this.saving = true;
    this.saveMessage = "";
    this.saveError = "";

    this.businessService
      .saveCategoryAttributeMapping({
        subCategoryId: this.selectedSubCategoryId,
        attributeMasterIds: Array.from(this.activeSelection),
        entityType: this.activeEntityTab,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.showNotification("Mapping saved successfully.");
          this.rebuildOrder(this.activeEntityTab);
        },
        error: (err) => {
          this.saving = false;
          this.showNotification("Failed to save mapping. Please try again.");
        },
      });
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }
}
