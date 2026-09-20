import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EventRoutingModule } from './event-routing.module';

import { EventHeaderComponent } from './components/event-header/event-header.component';
import { EventFooterComponent } from './components/event-footer/event-footer.component';
import { EventLayoutComponent } from './components/event-layout/event-layout.component';
import { EventHomeComponent } from './components/event-home/event-home.component';
import { AllEventCategoriesComponent } from './components/all-event-categories/all-event-categories.component';
import { EventsByCategoryComponent } from './components/events-by-category/events-by-category.component';
import { AllEventsComponent } from './components/all-events/all-events.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { AddEventComponent } from './components/add-event/add-event.component';

@NgModule({
  declarations: [
    EventHeaderComponent,
    EventFooterComponent,
    EventLayoutComponent,
    EventHomeComponent,
    AllEventCategoriesComponent,
    EventsByCategoryComponent,
    AllEventsComponent,
    EventDetailComponent,
    AddEventComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, EventRoutingModule],
})
export class EventModule {}
