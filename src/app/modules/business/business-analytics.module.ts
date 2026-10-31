import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessAnalyticsComponent } from './components/business-analytics/business-analytics.component';

@NgModule({
  declarations: [BusinessAnalyticsComponent],
  imports: [CommonModule, FormsModule],
  exports: [BusinessAnalyticsComponent],
})
export class BusinessAnalyticsModule {}
