import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BusinessLoginComponent } from "../business-login/business-login.component";

@Component({
  selector: "app-business-footer",
  templateUrl: "./business-footer.component.html",
  styleUrls: ["./business-footer.component.css"],
})
export class BusinessFooterComponent {
  dialogRef!: MatDialogRef<BusinessLoginComponent>;

  constructor(private dialog: MatDialog) {}

  registerNewBusiness() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(BusinessLoginComponent, {
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });

    this.dialogRef.afterClosed().subscribe(() => {});
  }
}
