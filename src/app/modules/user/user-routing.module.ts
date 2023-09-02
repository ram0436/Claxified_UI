import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './component/account/account.component';
import { MyAddsComponent } from './component/my-adds/my-adds.component';
import { PersonalComponent } from './component/personal/personal.component';
import { SecurityComponent } from './component/security/security.component';

const routes: Routes = [
    { path: 'account', component: AccountComponent ,},
    { path: 'account/personal', component: PersonalComponent },
    { path: 'account/myadds', component: MyAddsComponent },
    { path: 'account/security', component: SecurityComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }