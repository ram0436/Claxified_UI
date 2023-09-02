import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailsComponent } from './component/post-details/post-details.component';
import { AddPostComponent } from './component/add-post/add-post.component';
import { AppliancePostsComponent } from './component/appliance-posts/appliance-posts.component';
import { AuthGuard } from '../auth/authguard/authguard';

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: AppliancePostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ElectronicApplianceRoutingModule { }