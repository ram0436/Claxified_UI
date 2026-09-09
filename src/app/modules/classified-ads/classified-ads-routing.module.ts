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

  {
    path: "Electronics",
    loadChildren: () =>
      import("../electronic-appliance/electronic-appliance.module").then(
        (m) => m.ElectronicApplianceModule
      ),
  },
  {
    path: "Furniture",
    loadChildren: () =>
      import("../furniture/furniture.module").then((m) => m.FurnitureModule),
  },
  {
    path: "Sports",
    loadChildren: () =>
      import("../sport/sport.module").then((m) => m.SportModule),
  },
  {
    path: "Pets",
    loadChildren: () => import("../pet/pet.module").then((m) => m.PetModule),
  },
  {
    path: "Fashion",
    loadChildren: () =>
      import("../fashion/fashion.module").then((m) => m.FashionModule),
  },
  {
    path: "Books",
    loadChildren: () => import("../book/book.module").then((m) => m.BookModule),
  },
  {
    path: "Properties",
    loadChildren: () =>
      import("../property/property.module").then((m) => m.PropertyModule),
  },
  {
    path: "Jobs",
    loadChildren: () => import("../job/job.module").then((m) => m.JobModule),
  },
  {
    path: "Commercial Services",
    loadChildren: () =>
      import("../commercial-service/commercial-service.module").then(
        (m) => m.CommercialServiceModule
      ),
  },

  {
    path: "Gadgets",
    loadChildren: () =>
      import("../gadget/gadget.module").then((m) => m.GadgetModule),
  },
  {
    path: "Vehicles",
    loadChildren: () =>
      import("../vehicle/vehicle.module").then((m) => m.VehicleModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassifiedAdsRoutingModule {}
