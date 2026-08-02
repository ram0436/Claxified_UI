import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BusinessLayoutComponent } from "./components/business-layout/business-layout.component";
import { BusinessLandingComponent } from "./components/business-landing/business-landing.component";
import { BusinessRegisterComponent } from "./components/business-register/business-register.component";
import { BusinessDashboardComponent } from "./components/business-dashboard/business-dashboard.component";
import { BusinessEditProfileComponent } from "./components/business-edit-profile/business-edit-profile.component";
import { BusinessPublicProfileComponent } from "./components/business-public-profile/business-public-profile.component";
import { BusinessProfileComponent } from "./components/business-profile/business-profile.component";
import { BusinessDirectoriesComponent } from "./components/business-directories/business-directories.component";

const routes: Routes = [
  {
    path: "",
    component: BusinessLayoutComponent,
    children: [
      { path: "", component: BusinessLandingComponent },
      // { path: "register", component: BusinessRegisterComponent },
      { path: "directories", component: BusinessDirectoriesComponent },
      { path: "profile", component: BusinessProfileComponent },
      { path: "profile/edit", component: BusinessEditProfileComponent },
      { path: "profile/:tabRefGuid", component: BusinessProfileComponent },

      {
        path: ":location/:businessName",
        component: BusinessPublicProfileComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessRoutingModule {}
