import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPostComponent } from './component/add-post/add-post.component';
import { PostDetailComponent } from './component/post-detail/post-detail.component';
import { VehiclePostsComponent } from './component/vehicle-posts/vehicle-posts.component';
import { AuthGuard } from '../auth/authguard/authguard';
import { PostGuidResolver } from "src/app/shared/resolver/post-guid.resolver";

const routes: Routes = [
  { path: 'post-details/:id', component: PostDetailComponent},
    { path: ':city/:postSlug', component: PostDetailComponent, data: { categoryId: 2 }, resolve: { postGuid: PostGuidResolver } },
  { path: 'add-post', component: AddPostComponent,canActivate : [AuthGuard] },
  { path: 'view-posts', component: VehiclePostsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }