import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPostComponent } from './component/add-post/add-post.component';
import { BookFilterComponent } from './component/book-filter/book-filter.component';
import { BookPostsComponent } from './component/book-posts/book-posts.component';
import { PostDetailsComponent } from './component/post-details/post-details.component';
import { HttpClientModule } from '@angular/common/http';
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
import { BookRoutingModule } from './book-routing.module';
import { MatRadioModule } from '@angular/material/radio';



@NgModule({
  declarations: [
    AddPostComponent,
    BookFilterComponent,
    BookPostsComponent,
    PostDetailsComponent
  ],
  imports: [
    CommonModule,
    BookRoutingModule,
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
export class BookModule { }
