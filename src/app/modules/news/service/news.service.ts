import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  NewsArticle,
  NewsArticleDetail,
  NewsAuthor,
  NewsCategory,
  NewsSource,
  NewsSubCategory,
} from '../model/News';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // ---------------------------------------------------------
  // Sources
  // ---------------------------------------------------------
  getSources(): Observable<NewsSource[]> {
    return this.http.get<NewsSource[]>(`${this.baseUrl}/News/sources`);
  }

  // ---------------------------------------------------------
  // Authors
  // ---------------------------------------------------------
  getAuthors(): Observable<NewsAuthor[]> {
    return this.http.get<NewsAuthor[]>(`${this.baseUrl}/News/authors`);
  }

  // ---------------------------------------------------------
  // Categories
  // ---------------------------------------------------------
  getCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.baseUrl}/News/categories`);
  }

  getCategoryById(id: number): Observable<NewsCategory> {
    const params = new HttpParams().set('id', id);
    return this.http.get<NewsCategory>(`${this.baseUrl}/News/category`, {
      params,
    });
  }

  // ---------------------------------------------------------
  // Sub-categories
  // ---------------------------------------------------------
  getSubCategories(): Observable<NewsSubCategory[]> {
    return this.http.get<NewsSubCategory[]>(
      `${this.baseUrl}/News/sub-categories`,
    );
  }

  getSubCategoryById(subCategoryId: number): Observable<NewsSubCategory> {
    const params = new HttpParams().set('subCategoryId', subCategoryId);
    return this.http.get<NewsSubCategory>(
      `${this.baseUrl}/News/sub-category/subCategoryId`,
      { params },
    );
  }

  getSubCategoriesByCategoryId(
    categoryId: number,
  ): Observable<NewsSubCategory> {
    const params = new HttpParams().set('CategoryId', categoryId);
    return this.http.get<NewsSubCategory>(
      `${this.baseUrl}/News/sub-category/categoryId`,
      { params },
    );
  }

  // ---------------------------------------------------------
  // News articles
  // ---------------------------------------------------------
  getArticles(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(`${this.baseUrl}/News/news-article`);
  }

  getArticleById(articleId: number): Observable<NewsArticleDetail> {
    const params = new HttpParams().set('articleId', articleId);
    return this.http.get<NewsArticleDetail>(
      `${this.baseUrl}/News/news-article/articleId`,
      { params },
    );
  }

  createArticle(article: Partial<NewsArticle>): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(
      `${this.baseUrl}/News/news-article`,
      article,
    );
  }

  deleteArticle(articleId: number): Observable<any> {
    const params = new HttpParams().set('articleId', articleId);
    return this.http.delete(`${this.baseUrl}/News/news-article/articleId`, {
      params,
    });
  }
}
