import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "./shared/shared.module";
import { DashboardComponent } from "./modules/dashboard/dashboard.component";
import { PostMenuComponent } from "./modules/post-menu/post-menu.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { UserModule } from "./modules/user/user.module";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { JwtInterceptor } from "./modules/auth/interceptor/JwtInterceptor";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { PagesModule } from "./pages/pages.module";
import { MarketplaceComponent } from "./modules/marketplace/marketplace.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PostMenuComponent,
    MarketplaceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    SharedModule,
    DragDropModule,
    PagesModule,
    FormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
