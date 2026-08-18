import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { BusinessService } from "../../service/business.service";
import { BusinessOffer } from "../../model/Business";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-add-business-offer",
  templateUrl: "./add-business-offer.component.html",
  styleUrls: ["./add-business-offer.component.css"],
})
export class AddBusinessOfferComponent implements OnInit {
  @Input() businessId!: number;
  @Input() offer: BusinessOffer | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;
  formData: BusinessOffer = new BusinessOffer();

  constructor(
    private businessService: BusinessService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.offer) {
      this.formData = { ...this.offer };
    }
    this.formData.businessId = this.businessId;
  }

  saveOffer() {
    this.saving = true;
    this.businessService.saveOffer(this.formData).subscribe(
      () => {
        this.saving = false;
        this.showNotification("Offer Saved Successfully");
        this.saved.emit();
      },
      (error) => {
        this.saving = false;
        this.showNotification("Failed to save offer. Please try again.");
      }
    );
  }

  showNotification(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }
}
