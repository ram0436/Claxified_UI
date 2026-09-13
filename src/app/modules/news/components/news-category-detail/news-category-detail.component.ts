import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NewsService } from '../../service/news.service';
import { NewsArticle, NewsCategory, NewsSubCategory } from '../../model/News';

const CATEGORY_HERO_IMAGES: Record<string, string> = {
  business: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1400&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=80',
  india: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80',
  world: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=80',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=80',
  lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&q=80',
};

const PAGE_SIZE = 8;

@Component({
  selector: 'app-news-category-detail',
  templateUrl: './news-category-detail.component.html',
  styleUrls: ['./news-category-detail.component.css'],
})
export class NewsCategoryDetailComponent implements OnInit {
  allCategories: NewsCategory[] = [];
  subCategories: NewsSubCategory[] = [];
  articles: NewsArticle[] = [];

  currentCategory?: NewsCategory;
  activeSubCategoryId: number | null = null; // null = "All"
  currentPage = 1;

  loading = true;
  error = false;
  email = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      this.loadCategory(slug);
    });
  }

  loadCategory(slug: string): void {
    this.loading = true;
    this.error = false;
    this.activeSubCategoryId = null;
    this.currentPage = 1;

    forkJoin({
      categories: this.newsService.getCategories(),
      subCategories: this.newsService.getSubCategories(),
      articles: this.newsService.getArticles(),
    }).subscribe({
      next: ({ categories, subCategories, articles }) => {
        const seen = new Set<string>();
        this.allCategories = categories
          .filter((c) => {
            if (seen.has(c.slug)) return false;
            seen.add(c.slug);
            return true;
          })
          .sort((a, b) => a.displayOrder - b.displayOrder);

        this.currentCategory =
          this.allCategories.find((c) => c.slug === slug) || this.allCategories[0];

        this.subCategories = subCategories.filter(
          (sc) => sc.newsCategoryId === this.currentCategory?.id
        );

        this.articles = articles
          .filter((a) => a.newsCategoryId === this.currentCategory?.id)
          .sort(
            (a, b) =>
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime()
          );

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  get heroImage(): string {
    return (
      CATEGORY_HERO_IMAGES[this.currentCategory?.slug || ''] ||
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1400&q=80'
    );
  }

  get filteredArticles(): NewsArticle[] {
    if (this.activeSubCategoryId === null) return this.articles;
    return this.articles.filter((a) => a.newsSubCategoryId === this.activeSubCategoryId);
  }

  get featuredArticle(): NewsArticle | undefined {
    return this.filteredArticles[0];
  }

  get sideHeadlines(): NewsArticle[] {
    return this.filteredArticles.slice(1, 5);
  }

  get gridArticles(): NewsArticle[] {
    const start = 5 + (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredArticles.slice(start, start + PAGE_SIZE);
  }

  get totalPages(): number {
    const remaining = Math.max(this.filteredArticles.length - 5, 0);
    return Math.max(Math.ceil(remaining / PAGE_SIZE), 1);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get trendingInCategory(): NewsArticle[] {
    return [...this.articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }

  selectSubCategory(id: number | null): void {
    this.activeSubCategoryId = id;
    this.currentPage = 1;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  goToCategory(cat: NewsCategory): void {
    this.router.navigate(['/news/categories', cat.slug]);
  }

  goToArticle(article: NewsArticle): void {
    this.router.navigate(['/news/article', article.slug]);
  }

  timeAgo(dateStr?: string | null): string {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  reads(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K reads`;
    return `${count} reads`;
  }

  subscribe(): void {
    this.email = '';
  }
}
