import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { CommercialServicePostsComponent } from "./component/commercial-service-posts/commercial-service-posts.component";
import { PostDetailsComponent } from "./component/post-details/post-details.component";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: CommercialServicePostsComponent }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class CommercialServiceRoutingModule { }