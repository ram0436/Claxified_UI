import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  BusinessServiceDto,
  BusinessServiceImageDto,
} from "../../model/Business";

@Component({
  selector: "app-business-service-quickview",
  templateUrl: "./business-service-quickview.component.html",
  styleUrls: ["./business-service-quickview.component.css"],
})
export class BusinessServiceQuickviewComponent {
  @Input() service!: BusinessServiceDto;
  @Output() close = new EventEmitter<void>();
  @Output() viewFullDetails = new EventEmitter<void>();

  activeImageIndex = 0;

  // Pricing type display mapping
  private readonly pricingTypeDisplayMap: { [key: string]: string } = {
    FixedPrice: "Fixed Price",
    StartingFrom: "Starting From",
    PriceRange: "Price Range",
    Hourly: "Hourly",
    Daily: "Daily",
    CustomQuote: "Custom Quote",
  };

  // Service mode display mapping
  private readonly serviceModeDisplayMap: { [key: string]: string } = {
    AtBusiness: "At Business",
    AtCustomerLocation: "At Customer Location",
    Remote: "Remote",
  };

  // Availability status display mapping
  private readonly availabilityDisplayMap: { [key: string]: string } = {
    Available: "Available",
    TemporarilyUnavailable: "Temporarily Unavailable",
    NotAvailable: "Not Available",
  };

  get sortedImages() {
    return [...(this.service.images || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
  }

  get activeImage(): BusinessServiceImageDto | undefined {
    return (
      this.sortedImages[this.activeImageIndex] ||
      this.sortedImages.find((i) => i.isPrimary) ||
      this.sortedImages[0]
    );
  }

  setActiveImage(i: number) {
    this.activeImageIndex = i;
  }

  // Fixed: Removed the | number pipe from TypeScript
  get priceDisplay(): string {
    if (this.service.pricingType === "PriceRange") {
      return `₹${this.service.minimumPrice} - ₹${this.service.maximumPrice}`;
    } else if (this.service.pricingType === "CustomQuote") {
      return "Custom Quote";
    } else {
      return `₹${this.service.minimumPrice}`;
    }
  }

  get pricingTypeDisplay(): string {
    return (
      this.pricingTypeDisplayMap[this.service.pricingType] ||
      this.service.pricingType
    );
  }

  get serviceModeDisplay(): string {
    return (
      this.serviceModeDisplayMap[this.service.serviceMode] ||
      this.service.serviceMode
    );
  }

  get availabilityDisplay(): string {
    return (
      this.availabilityDisplayMap[this.service.availabilityStatus] ||
      this.service.availabilityStatus
    );
  }

  get durationDisplay(): string {
    if (!this.service.duration) return "Not specified";
    const unitMap: { [key: string]: string } = {
      Minute: "Minute(s)",
      Hour: "Hour(s)",
      Day: "Day(s)",
      Week: "Week(s)",
      Month: "Month(s)",
    };
    const unit =
      unitMap[this.service.durationUnit] || this.service.durationUnit;
    return `${this.service.duration} ${unit}`;
  }

  get isPriceOnRequest(): boolean {
    return this.service.pricingType === "CustomQuote";
  }

  get gstIncludedDisplay(): string {
    return this.service.gstIncluded === "Yes"
      ? "GST Included"
      : "GST Not Included";
  }

  get bookingRequiredDisplay(): string {
    return this.service.isBookingRequired === "Yes"
      ? "Booking Required"
      : "Booking Not Required";
  }

  get formattedPrice(): string {
    if (this.service.pricingType === "PriceRange") {
      return `₹${this.service.minimumPrice} - ₹${this.service.maximumPrice}`;
    } else if (this.service.pricingType === "CustomQuote") {
      return "Custom Quote";
    } else {
      return `₹${this.service.minimumPrice}`;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onViewFullDetails(): void {
    this.viewFullDetails.emit();
  }

  onContactBusiness(): void {
    // Implement contact business logic
    console.log("Contact business for service:", this.service.id);
  }

  // Helper to check if service has any images
  get hasImages(): boolean {
    return this.sortedImages && this.sortedImages.length > 0;
  }
}
