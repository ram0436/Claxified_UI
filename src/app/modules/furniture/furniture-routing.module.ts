import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PostDetailsComponent } from "./component/post-details/post-details.component";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { AuthGuard } from "../auth/authguard/authguard";
import { FurniturePostsComponent } from "./component/furniture-posts/furniture-posts.component";
import { PostGuidResolver } from "src/app/shared/resolver/post-guid.resolver";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: ':city/:postSlug', component: PostDetailsComponent, data: { categoryId: 6 }, resolve: { postGuid: PostGuidResolver } },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: FurniturePostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FurnitureRoutingModule { }