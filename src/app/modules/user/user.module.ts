import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountComponent } from './component/account/account.component';
import { PersonalComponent } from './component/personal/personal.component';
import { MyAddsComponent } from './component/my-adds/my-adds.component';
import { UserRoutingModule } from './user-routing.module';
import { SecurityComponent } from './component/security/security.component';


@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    AccountComponent,
    PersonalComponent,
    MyAddsComponent,
    SecurityComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    UserRoutingModule
  ]
})
export class UserModule { }
