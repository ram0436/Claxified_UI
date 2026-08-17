import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BusinessService } from "../../service/business.service";
import {
  BusinessServiceDto,
  BusinessServiceImageDto,
} from "../../model/Business";

@Component({
  selector: "app-business-service-detail",
  templateUrl: "./business-service-detail.component.html",
  styleUrls: ["./business-service-detail.component.css"],
})
export class BusinessServiceDetailComponent implements OnInit {
  loading = true;
  service: BusinessServiceDto | null = null;
  isOwner = false;
  activeImageIndex = 0;

  // Display mappings
  private readonly pricingTypeDisplayMap: { [key: string]: string } = {
    FixedPrice: "Fixed Price",
    StartingFrom: "Starting From",
    PriceRange: "Price Range",
    Hourly: "Hourly",
    Daily: "Daily",
    CustomQuote: "Custom Quote",
  };

  private readonly serviceModeDisplayMap: { [key: string]: string } = {
    AtBusiness: "At Business",
    AtCustomerLocation: "At Customer Location",
    Remote: "Remote",
  };

  private readonly availabilityDisplayMap: { [key: string]: string } = {
    Available: "Available",
    TemporarilyUnavailable: "Temporarily Unavailable",
    NotAvailable: "Not Available",
  };

  private readonly durationUnitMap: { [key: string]: string } = {
    Minute: "Minute(s)",
    Hour: "Hour(s)",
    Day: "Day(s)",
    Week: "Week(s)",
    Month: "Month(s)",
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService
  ) {}

  ngOnInit(): void {
    const navState = window.history.state as { isOwner?: boolean } | undefined;
    this.isOwner = navState?.isOwner === true;

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get("serviceId"));
      if (id) this.loadService(id);
    });
  }

  loadService(id: number): void {
    this.loading = true;
    this.businessService.getBusinessServiceDetails(id).subscribe({
      next: (service) => {
        this.service = service;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get sortedImages() {
    return [...(this.service?.images || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
  }

  get activeImage(): BusinessServiceImageDto | undefined {
    return this.sortedImages[this.activeImageIndex];
  }

  setActiveImage(i: number) {
    this.activeImageIndex = i;
  }

  // Price display helpers
  get priceDisplay(): string {
    if (!this.service) return "0";
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
      this.pricingTypeDisplayMap[this.service?.pricingType || ""] ||
      this.service?.pricingType ||
      ""
    );
  }

  get serviceModeDisplay(): string {
    return (
      this.serviceModeDisplayMap[this.service?.serviceMode || ""] ||
      this.service?.serviceMode ||
      ""
    );
  }

  get availabilityDisplay(): string {
    return (
      this.availabilityDisplayMap[this.service?.availabilityStatus || ""] ||
      this.service?.availabilityStatus ||
      ""
    );
  }

  get durationDisplay(): string {
    if (!this.service?.duration) return "Not specified";
    const unit =
      this.durationUnitMap[this.service.durationUnit] ||
      this.service.durationUnit;
    return `${this.service.duration} ${unit}`;
  }

  get isPriceOnRequest(): boolean {
    return this.service?.pricingType === "CustomQuote";
  }

  get gstIncludedDisplay(): string {
    return this.service?.gstIncluded === "Yes"
      ? "GST Included"
      : "GST Not Included";
  }

  get bookingRequiredDisplay(): string {
    return this.service?.isBookingRequired === "Yes"
      ? "Booking Required"
      : "Booking Not Required";
  }

  get isAvailable(): boolean {
    return this.service?.availabilityStatus === "Available";
  }

  get formattedMinimumPrice(): number {
    return this.service?.minimumPrice || 0;
  }

  get formattedMaximumPrice(): number {
    return this.service?.maximumPrice || 0;
  }

  goBack(): void {
    window.history.back();
  }

  editService(): void {
    if (!this.service) return;
    this.router.navigate(["/business/service", this.service.id, "edit"]);
  }

  onContactBusiness(): void {}

  onShare(): void {}

  onBookService(): void {}
}
