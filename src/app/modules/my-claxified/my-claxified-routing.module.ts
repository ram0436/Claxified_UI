import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaxifiedLayoutComponent } from './components/claxified-layout/claxified-layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MyListingsComponent } from './components/my-listings/my-listings.component';
import { MyBusinessesComponent } from './components/my-businesses/my-businesses.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { PackagesBillingComponent } from './components/packages-billing/packages-billing.component';
import { AdminOverviewComponent } from './components/admin-overview/admin-overview.component';
import { AuthGuard } from '../auth/authguard/authguard';
import { AttributeMappingComponent } from './components/attribute-mapping/attribute-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: ClaxifiedLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: OverviewComponent },
      { path: 'my-listings', component: MyListingsComponent },
      { path: 'my-businesses', component: MyBusinessesComponent },
      {
        path: 'enquiries',
        component: ComingSoonComponent,
        data: {
          title: 'Enquiries & Leads',
          description:
            'Manage and respond to enquiries, leads and messages from across Claxified.',
        },
      },
      {
        path: 'analytics',
        component: ComingSoonComponent,
        data: {
          title: 'Analytics',
          description:
            'Track your performance, understand your audience and grow faster with Claxified.',
        },
      },
      { path: 'billing', component: PackagesBillingComponent },
      { path: 'settings', component: SettingsComponent },
      {
        path: 'admin-overview',
        component: AdminOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'attribute-mapping',
        component: AttributeMappingComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyClaxifiedRoutingModule {}
