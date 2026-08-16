import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

import { BusinessRoutingModule } from "./business-routing.module";
import { BusinessLayoutComponent } from "./components/business-layout/business-layout.component";
import { BusinessHeaderComponent } from "./components/business-header/business-header.component";
import { BusinessLandingComponent } from "./components/business-landing/business-landing.component";
import { BusinessRegisterComponent } from "./components/business-register/business-register.component";
import { BusinessDashboardComponent } from "./components/business-dashboard/business-dashboard.component";
import { BusinessEditProfileComponent } from "./components/business-edit-profile/business-edit-profile.component";
import { BusinessPublicProfileComponent } from "./components/business-public-profile/business-public-profile.component";
import { BusinessLoginComponent } from "./components/business-login/business-login.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { BusinessProfileComponent } from "./components/business-profile/business-profile.component";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatCardModule } from "@angular/material/card";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BusinessFooterComponent } from "./components/business-footer/business-footer.component";
import { BusinessDirectoriesComponent } from "./components/business-directories/business-directories.component";
import { MatMenuModule } from "@angular/material/menu";
import { BusinessPageComponent } from "./components/business-page/business-page.component";
import { AddBusinessProductComponent } from "./components/add-business-product/add-business-product.component";
import { BusinessProductQuickviewComponent } from './components/business-product-quickview/business-product-quickview.component';
import { BusinessProductDetailComponent } from './components/business-product-detail/business-product-detail.component';

@NgModule({
  declarations: [
    BusinessLayoutComponent,
    BusinessHeaderComponent,
    BusinessLandingComponent,
    BusinessRegisterComponent,
    BusinessDashboardComponent,
    BusinessEditProfileComponent,
    BusinessPublicProfileComponent,
    BusinessLoginComponent,
    BusinessProfileComponent,
    BusinessFooterComponent,
    BusinessDirectoriesComponent,
    BusinessPageComponent,
    AddBusinessProductComponent,
    BusinessProductQuickviewComponent,
    BusinessProductDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    BusinessRoutingModule,
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
export class BusinessModule {}
