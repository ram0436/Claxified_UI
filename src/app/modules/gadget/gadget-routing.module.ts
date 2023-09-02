import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPostComponent } from './component/add-post/add-post.component';
import { GadgetPostsComponent } from './component/gadget-posts/gadget-posts.component';
import { PostDetailComponent } from './component/post-detail/post-detail.component';
import { AuthGuard } from '../auth/authguard/authguard';

const routes: Routes = [
  { path: 'post-details/:id', component: PostDetailComponent },
  { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
  { path: 'view-posts', component: GadgetPostsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GadgetRoutingModule { }