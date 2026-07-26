import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BusinessLoginComponent } from "../business-login/business-login.component";

@Component({
  selector: "app-business-header",
  templateUrl: "./business-header.component.html",
  styleUrls: ["./business-header.component.css"],
})
export class BusinessHeaderComponent {
  dialogRef!: MatDialogRef<BusinessLoginComponent>;

  constructor(private dialog: MatDialog) {}

  openBusinessLoginModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(BusinessLoginComponent, {
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });

    // const dialogRefElement = document.querySelector(
    //   ".business-login-dialog-container"
    // );
    // if (dialogRefElement) {
    //   dialogRefElement.setAttribute("style", "margin-top: 150px");
    // }

    this.dialogRef.afterClosed().subscribe(() => {});
  }
}
