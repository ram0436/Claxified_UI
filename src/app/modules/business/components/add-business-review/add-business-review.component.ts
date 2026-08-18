import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { BusinessService } from "../../service/business.service";
import { BusinessReview } from "../../model/Business";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-add-business-review",
  templateUrl: "./add-business-review.component.html",
  styleUrls: ["./add-business-review.component.css"],
})
export class AddBusinessReviewComponent implements OnInit {
  @Input() businessId!: number;
  @Input() review: BusinessReview | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;
  hoverRating = 0;
  formData: BusinessReview = new BusinessReview();

  private ratingLabels: { [key: number]: string } = {
    0: "Select rating",
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  constructor(
    private businessService: BusinessService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.review) {
      this.formData = { ...this.review };
    }
    this.formData.businessId = this.businessId;
    this.formData.userId = Number(localStorage.getItem("id")) || 0;
  }

  setRating(rating: number) {
    this.formData.rating = rating;
  }

  getRatingLabel(rating: number): string {
    return this.ratingLabels[rating] || "Select rating";
  }

  saveReview() {
    if (this.formData.rating === 0) {
      alert("Please select a rating.");
      return;
    }
    this.saving = true;
    this.businessService.saveReview(this.formData).subscribe(
      () => {
        this.saving = false;
        this.showNotification("Review Saved Successfully");
        this.saved.emit();
      },
      (error) => {
        this.saving = false;
        this.showNotification("Failed to save review. Please try again.");
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
