import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { PostDetailsComponent } from "./component/post-details/post-details.component";
import { PropertyPostsComponent } from "./component/property-posts/property-posts.component";
import { PostGuidResolver } from "src/app/shared/resolver/post-guid.resolver";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: ':city/:postSlug', component: PostDetailsComponent, data: { categoryId: 3 }, resolve: { postGuid: PostGuidResolver } },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: PropertyPostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PropertyRoutingModule { }