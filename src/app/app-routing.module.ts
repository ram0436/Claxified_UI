import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./modules/dashboard/dashboard.component";
import { PostMenuComponent } from "./modules/post-menu/post-menu.component";
import { AuthGuard } from "./modules/auth/authguard/authguard";
import { VacancyOpeningComponent } from "./shared/component/vacancy-opening/vacancy-opening.component";
import { HelpComponent } from "./modules/user/component/help/help.component";
import { PageComponent } from "./pages/page/page.component";
import { MarketplaceComponent } from "./modules/marketplace/marketplace.component";

const routes: Routes = [
  { path: "", component: MarketplaceComponent },
  {
    path: "business",
    loadChildren: () =>
      import("./modules/business/business.module").then(
        (m) => m.BusinessModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "classified-ads",
    loadChildren: () =>
      import("./modules/classified-ads/classified-ads.module").then(
        (m) => m.ClassifiedAdsModule
      ),
  },
  {
    path: "user",
    loadChildren: () =>
      import("./modules/user/user.module").then((m) => m.UserModule),
    canActivate: [AuthGuard],
  },
  { path: "post-menu", component: PostMenuComponent, canActivate: [AuthGuard] },
  {
    path: "Admin",
    loadChildren: () =>
      import("./modules/admin/admin.module").then((m) => m.AdminModule),
  },
  { path: "vacancy-opening", component: VacancyOpeningComponent },
  { path: "help", component: HelpComponent },
  { path: "page/:slug", component: PageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
