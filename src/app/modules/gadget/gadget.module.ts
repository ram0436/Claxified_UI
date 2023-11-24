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
import { SharedModule } from 'src/app/shared/shared.module';
import { AddPostComponent } from './component/add-post/add-post.component';
import { GadgetFilterComponent } from './component/gadget-filter/gadget-filter.component';
import { PostDetailComponent } from './component/post-detail/post-detail.component';
import { GadgetRoutingModule } from './gadget-routing.module';
import { GadgetPostsComponent } from './component/gadget-posts/gadget-posts.component';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    PostDetailComponent,
    AddPostComponent,
    GadgetFilterComponent,
    GadgetPostsComponent
  ],
  imports: [
    CommonModule,
    GadgetRoutingModule,
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
    MatSelectModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSliderModule,
    MatRadioModule
  ]
})
export class GadgetModule { }
