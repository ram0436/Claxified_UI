import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewsLayoutComponent } from './components/news-layout/news-layout.component';
import { NewsHomeComponent } from './components/news-home/news-home.component';
import { AllNewsCategoriesComponent } from './components/all-news-categories/all-news-categories.component';
import { NewsCategoryDetailComponent } from './components/news-category-detail/news-category-detail.component';
import { EditorPicksComponent } from './components/editor-picks/editor-picks.component';
import { AllHeadlinesComponent } from './components/all-headlines/all-headlines.component';
import { NewsArticleDetailComponent } from './components/news-article-detail/news-article-detail.component';
import { AddNewsArticleComponent } from './components/add-news-article/add-news-article.component';

const routes: Routes = [
  {
    path: '',
    component: NewsLayoutComponent,
    children: [
      { path: '', component: NewsHomeComponent },
      { path: 'categories', component: AllNewsCategoriesComponent },
      { path: 'categories/:slug', component: NewsCategoryDetailComponent },
      { path: 'headlines', component: AllHeadlinesComponent },
      { path: 'editors-picks', component: EditorPicksComponent },
      { path: 'article/:slug', component: NewsArticleDetailComponent },
      { path: 'add-article', component: AddNewsArticleComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsRoutingModule {}
