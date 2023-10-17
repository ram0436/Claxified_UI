import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './component/admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {NgFor} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [
    AdminDashboardComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatFormFieldModule, 
    MatSelectModule, 
    NgFor, 
    MatInputModule, 
    FormsModule,
    MatCardModule
  ]
})
export class AdminModule { }
