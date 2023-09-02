import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddPostComponent } from './component/add-post/add-post.component';
import { PostDetailComponent } from './component/post-detail/post-detail.component';
import { VehicleFilterComponent } from './component/vehicle-filter/vehicle-filter.component';
import { VehicleRoutingModule } from './vehicle-routing.module';
import { VehiclePostsComponent } from './component/vehicle-posts/vehicle-posts.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

const routes: Routes = [
  { path: 'post-details', component: PostDetailComponent }
];

@NgModule({
  declarations: [
    PostDetailComponent,
    AddPostComponent,
    VehicleFilterComponent,
    VehiclePostsComponent
  ],
  imports: [
    CommonModule,
    VehicleRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSliderModule,
    MatCheckboxModule
  ]
})
export class VehicleModule { }
