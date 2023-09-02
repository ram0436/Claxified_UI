import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { PostDetailsComponent } from "./component/post-details/post-details.component";
import { PropertyPostsComponent } from "./component/property-posts/property-posts.component";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: PropertyPostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PropertyRoutingModule { }