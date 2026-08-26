import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatCardModule } from "@angular/material/card";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatMenuModule } from "@angular/material/menu";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ClassifiedAdsRoutingModule } from "./classified-ads-routing.module";
import { ClassifiedAdsHomeComponent } from './components/classified-ads-home/classified-ads-home.component';

@NgModule({
  declarations: [DashboardComponent, ClassifiedAdsHomeComponent],
  imports: [
    CommonModule,
    ClassifiedAdsRoutingModule,
    RouterModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule,
    MatMenuModule,
    ReactiveFormsModule,
  ],
})
export class ClassifiedAdsModule {}
