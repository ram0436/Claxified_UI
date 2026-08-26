import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ClassifiedAdsHomeComponent } from "./components/classified-ads-home/classified-ads-home.component";

const routes: Routes = [
  {
    path: "",
    component: ClassifiedAdsHomeComponent,
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassifiedAdsRoutingModule {}
