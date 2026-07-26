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

@NgModule({
  declarations: [
    BusinessLayoutComponent,
    BusinessHeaderComponent,
    BusinessLandingComponent,
    BusinessRegisterComponent,
    BusinessDashboardComponent,
    BusinessEditProfileComponent,
    BusinessPublicProfileComponent,
  ],
  imports: [CommonModule, RouterModule, BusinessRoutingModule],
})
export class BusinessModule {}
