import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  BusinessProductDto,
  BusinessProductImageDto,
} from "../../model/Business";

@Component({
  selector: "app-business-product-quickview",
  templateUrl: "./business-product-quickview.component.html",
  styleUrls: ["./business-product-quickview.component.css"],
})
export class BusinessProductQuickviewComponent {
  @Input() product!: BusinessProductDto;
  @Output() close = new EventEmitter<void>();
  @Output() viewFullDetails = new EventEmitter<void>();

  activeImageIndex = 0;

  get sortedImages() {
    return [...(this.product.images || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
  }

  get activeImage(): BusinessProductImageDto | undefined {
    return (
      this.sortedImages[this.activeImageIndex] ||
      this.sortedImages.find((i) => i.isPrimary) ||
      this.sortedImages[0]
    );
  }

  setActiveImage(i: number) {
    this.activeImageIndex = i;
  }

  get discountedPrice(): number {
    if (!this.product.discountPercentage) return this.product.price;
    return Math.round(
      this.product.price -
        (this.product.price * this.product.discountPercentage) / 100
    );
  }

  onClose(): void {
    this.close.emit();
  }

  onViewFullDetails(): void {
    this.viewFullDetails.emit();
  }

  onContactBusiness(): void {}
}
