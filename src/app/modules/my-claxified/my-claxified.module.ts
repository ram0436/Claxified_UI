import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MyClaxifiedRoutingModule } from './my-claxified-routing.module';
import { ClaxifiedLayoutComponent } from './components/claxified-layout/claxified-layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MyListingsComponent } from './components/my-listings/my-listings.component';
import { MyBusinessesComponent } from './components/my-businesses/my-businesses.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { PackagesBillingComponent } from './components/packages-billing/packages-billing.component';
import { AdminOverviewComponent } from './components/admin-overview/admin-overview.component';

@NgModule({
  declarations: [
    ClaxifiedLayoutComponent,
    OverviewComponent,
    MyListingsComponent,
    MyBusinessesComponent,
    SettingsComponent,
    ComingSoonComponent,
    PackagesBillingComponent,
    AdminOverviewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MyClaxifiedRoutingModule,
  ],
})
export class MyClaxifiedModule {}
