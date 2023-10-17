import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PostMenuComponent } from './modules/post-menu/post-menu.component';
import { AuthGuard } from './modules/auth/authguard/authguard';

const routes: Routes = [
  { path: 'Gadgets', loadChildren: () => import('./modules/gadget/gadget.module').then(m => m.GadgetModule) },
  { path: 'Vehicles', loadChildren: () => import('./modules/vehicle/vehicle.module').then(m => m.VehicleModule) },
  { path: 'user', loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),canActivate: [AuthGuard] },
  { path: 'Electronics & Appliances', loadChildren: () => import('./modules/electronic-appliance/electronic-appliance.module').then(m => m.ElectronicApplianceModule)},
  { path: 'Furniture', loadChildren: () => import('./modules/furniture/furniture.module').then(m => m.FurnitureModule) },
  { path: 'Sports & Hobbies', loadChildren: () => import('./modules/sport/sport.module').then(m => m.SportModule) },
  { path: 'Pets', loadChildren: () => import('./modules/pet/pet.module').then(m => m.PetModule) },
  { path: 'Fashion', loadChildren: () => import('./modules/fashion/fashion.module').then(m => m.FashionModule) },
  { path: 'Books', loadChildren: () => import('./modules/book/book.module').then(m => m.BookModule) },
  { path: 'Properties', loadChildren: () => import('./modules/property/property.module').then(m => m.PropertyModule) },
  { path: 'Jobs', loadChildren: () => import('./modules/job/job.module').then(m => m.JobModule) },
  { path: 'Commercial Services', loadChildren: () => import('./modules/commercial-service/commercial-service.module').then(m => m.CommercialServiceModule) },
  { path : '', component : DashboardComponent},
  { path : 'post-menu', component : PostMenuComponent,canActivate: [AuthGuard]},
  { path: 'Admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
