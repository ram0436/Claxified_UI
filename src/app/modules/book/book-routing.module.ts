import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../auth/authguard/authguard";
import { AddPostComponent } from "./component/add-post/add-post.component";
import { BookPostsComponent } from "./component/book-posts/book-posts.component";
import { PostDetailsComponent } from "./component/post-details/post-details.component";
import { PostGuidResolver } from "src/app/shared/resolver/post-guid.resolver";

const routes: Routes = [
    { path: 'post-details/:id', component: PostDetailsComponent },
    { path: ':city/:postSlug', component: PostDetailsComponent, data: { categoryId: 7 }, resolve: { postGuid: PostGuidResolver } },
    { path: 'add-post', component: AddPostComponent,canActivate :[AuthGuard]},
    { path: 'view-posts', component: BookPostsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BookRoutingModule { }