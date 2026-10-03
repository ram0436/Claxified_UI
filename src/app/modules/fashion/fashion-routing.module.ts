import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { FashionPostsComponent } from "./component/fashion-posts/fashion-posts.component";
import { PostDetailsComponent } from "./component/post-details/post-details.component";
import { PostGuidResolver } from "src/app/shared/resolver/post-guid.resolver";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: ':city/:postSlug', component: PostDetailsComponent, data: { categoryId: 10 }, resolve: { postGuid: PostGuidResolver } },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: FashionPostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FashionRoutingModule { }