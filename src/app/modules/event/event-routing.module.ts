import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EventLayoutComponent } from './components/event-layout/event-layout.component';
import { EventHomeComponent } from './components/event-home/event-home.component';
import { AllEventCategoriesComponent } from './components/all-event-categories/all-event-categories.component';
import { EventsByCategoryComponent } from './components/events-by-category/events-by-category.component';
import { AllEventsComponent } from './components/all-events/all-events.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { AddEventComponent } from './components/add-event/add-event.component';

const routes: Routes = [
  {
    path: '',
    component: EventLayoutComponent,
    children: [
      { path: '', component: EventHomeComponent },
      { path: 'categories', component: AllEventCategoriesComponent },
      { path: 'categories/:slug', component: EventsByCategoryComponent },
      { path: 'all', component: AllEventsComponent },
      { path: 'event/:slug', component: EventDetailComponent },
      { path: 'register', component: AddEventComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
