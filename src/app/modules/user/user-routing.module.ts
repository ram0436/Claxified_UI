import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './component/account/account.component';
import { MyAddsComponent } from './component/my-adds/my-adds.component';
import { PersonalComponent } from './component/personal/personal.component';
import { SecurityComponent } from './component/security/security.component';
import { SavedComponent } from './component/saved/saved.component';
import { HelpComponent } from './component/help/help.component';
import { FeedbackFormComponent } from './component/feedback-form/feedback-form.component';

const routes: Routes = [
    { path: 'account', component: AccountComponent ,},
    { path: 'account/personal', component: PersonalComponent },
    { path: 'account/myadds', component: MyAddsComponent },
    { path: 'account/security', component: SecurityComponent },
    { path: 'account/saved', component: SavedComponent },
    { path: 'account/help', component: HelpComponent },
    { path: 'account/feedback', component: FeedbackFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }