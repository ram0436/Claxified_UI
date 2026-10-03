import { NgModule } from "@angular/core";
import { RouterModule, Routes, UrlMatcher, UrlSegment } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ClassifiedAdsHomeComponent } from "./components/classified-ads-home/classified-ads-home.component";

/**
 * Matches a category segment case-insensitively and treats spaces / "-" / "&" the same,
 * so both the old "/classified-ads/Properties/..." and the new
 * "/classified-ads/properties/bangalore/title-slug" URLs reach the same module.
 */
function categoryMatcher(...names: string[]): UrlMatcher {
  const norm = (v: string) =>
    v.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const wanted = names.map(norm);
  return (segments: UrlSegment[]) =>
    segments.length > 0 && wanted.includes(norm(segments[0].path))
      ? { consumed: [segments[0]] }
      : null;
}

const routes: Routes = [
  {
    path: "",
    component: ClassifiedAdsHomeComponent,
    children: [],
  },

  {
    matcher: categoryMatcher("Electronics", "Electronics & Appliances"),
    loadChildren: () =>
      import("../electronic-appliance/electronic-appliance.module").then(
        (m) => m.ElectronicApplianceModule
      ),
  },
  {
    matcher: categoryMatcher("Furniture"),
    loadChildren: () =>
      import("../furniture/furniture.module").then((m) => m.FurnitureModule),
  },
  {
    matcher: categoryMatcher("Sports", "Sports & Hobbies"),
    loadChildren: () =>
      import("../sport/sport.module").then((m) => m.SportModule),
  },
  {
    matcher: categoryMatcher("Pets"),
    loadChildren: () => import("../pet/pet.module").then((m) => m.PetModule),
  },
  {
    matcher: categoryMatcher("Fashion"),
    loadChildren: () =>
      import("../fashion/fashion.module").then((m) => m.FashionModule),
  },
  {
    matcher: categoryMatcher("Books"),
    loadChildren: () => import("../book/book.module").then((m) => m.BookModule),
  },
  {
    matcher: categoryMatcher("Properties"),
    loadChildren: () =>
      import("../property/property.module").then((m) => m.PropertyModule),
  },
  {
    matcher: categoryMatcher("Jobs"),
    loadChildren: () => import("../job/job.module").then((m) => m.JobModule),
  },
  {
    matcher: categoryMatcher("Commercial Services", "Commercial Service"),
    loadChildren: () =>
      import("../commercial-service/commercial-service.module").then(
        (m) => m.CommercialServiceModule
      ),
  },

  {
    matcher: categoryMatcher("Gadgets"),
    loadChildren: () =>
      import("../gadget/gadget.module").then((m) => m.GadgetModule),
  },
  {
    matcher: categoryMatcher("Vehicles"),
    loadChildren: () =>
      import("../vehicle/vehicle.module").then((m) => m.VehicleModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassifiedAdsRoutingModule {}
