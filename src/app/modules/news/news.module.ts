import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsRoutingModule } from './news-routing.module';
import { NewsHeaderComponent } from './components/news-header/news-header.component';
import { NewsFooterComponent } from './components/news-footer/news-footer.component';
import { NewsLayoutComponent } from './components/news-layout/news-layout.component';
import { NewsHomeComponent } from './components/news-home/news-home.component';
import { AllNewsCategoriesComponent } from './components/all-news-categories/all-news-categories.component';
import { NewsCategoryDetailComponent } from './components/news-category-detail/news-category-detail.component';
import { EditorPicksComponent } from './components/editor-picks/editor-picks.component';
import { AllHeadlinesComponent } from './components/all-headlines/all-headlines.component';
import { NewsArticleDetailComponent } from './components/news-article-detail/news-article-detail.component';
import { AddNewsArticleComponent } from './components/add-news-article/add-news-article.component';

@NgModule({
  declarations: [
    NewsHeaderComponent,
    NewsFooterComponent,
    NewsLayoutComponent,
    NewsHomeComponent,
    AllNewsCategoriesComponent,
    NewsCategoryDetailComponent,
    EditorPicksComponent,
    AllHeadlinesComponent,
    NewsArticleDetailComponent,
    AddNewsArticleComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, NewsRoutingModule],
})
export class NewsModule {}
