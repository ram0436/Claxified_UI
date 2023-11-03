import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { HeaderComponent } from './component/header/header.component';
import { PostCardComponent } from './component/post-card/post-card.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './component/footer/footer.component';
import { LocationsComponent } from './component/locations/locations.component';
import { VacancyOpeningComponent } from './component/vacancy-opening/vacancy-opening.component';
import { GetHelpComponent } from './component/get-help/get-help.component';

@NgModule({
  declarations: [
    HeaderComponent,
    PostCardComponent,
    FooterComponent,
    LocationsComponent,
    VacancyOpeningComponent,
    GetHelpComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    HttpClientModule,
    MatMenuModule,
    MatSnackBarModule,
    RouterModule,
    MatProgressBarModule,
    MatOptionModule,
    MatSelectModule
  ],
  exports : [
    PostCardComponent,
    HeaderComponent,
    FooterComponent,
    LocationsComponent,
  ]
})
export class SharedModule { }
