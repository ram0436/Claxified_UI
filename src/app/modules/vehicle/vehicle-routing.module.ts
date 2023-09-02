import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPostComponent } from './component/add-post/add-post.component';
import { PostDetailComponent } from './component/post-detail/post-detail.component';
import { VehiclePostsComponent } from './component/vehicle-posts/vehicle-posts.component';
import { AuthGuard } from '../auth/authguard/authguard';

const routes: Routes = [
  { path: 'post-details/:id', component: PostDetailComponent},
  { path: 'add-post', component: AddPostComponent,canActivate : [AuthGuard] },
  { path: 'view-posts', component: VehiclePostsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }