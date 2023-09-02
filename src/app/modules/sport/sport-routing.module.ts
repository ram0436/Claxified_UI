import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PostDetailsComponent } from "./component/post-details/post-details.component";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { AuthGuard } from "../auth/authguard/authguard";
import { SportPostsComponent } from "./component/sport-posts/sport-posts.component";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: SportPostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SportRoutingModule { }