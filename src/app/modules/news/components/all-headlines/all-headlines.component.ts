import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NewsService } from '../../service/news.service';
import { NewsArticle, NewsCategory } from '../../model/News';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-all-headlines',
  templateUrl: './all-headlines.component.html',
  styleUrls: ['./all-headlines.component.css'],
})
export class AllHeadlinesComponent implements OnInit {
  categories: NewsCategory[] = [];
  articles: NewsArticle[] = [];

  loading = true;
  error = false;

  searchQuery = '';
  location = 'Bengaluru';
  activeCategoryId: number | null = null; // null = "All News"
  currentPage = 1;

  popularTopics = [
    'Bengaluru', 'Startup', 'Metro', 'Real Estate', 'Gold Price', 'Monsoon', 'IPL 2026', 'Budget', 'AI', 'Electric Vehicles',
  ];

  socialLinks = [
    { icon: 'facebook', link: 'https://facebook.com' },
    { icon: 'x', link: 'https://x.com' },
    { icon: 'instagram', link: 'https://instagram.com' },
    { icon: 'youtube', link: 'https://youtube.com' },
    { icon: 'linkedin', link: 'https://linkedin.com' },
  ];

  constructor(
    private newsService: NewsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('q') || '';
    });
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.error = false;

    forkJoin({
      categories: this.newsService.getCategories(),
      articles: this.newsService.getArticles(),
    }).subscribe({
      next: ({ categories, articles }) => {
        const seen = new Set<string>();
        this.categories = categories
          .filter((c) => {
            if (seen.has(c.slug)) return false;
            seen.add(c.slug);
            return true;
          })
          .sort((a, b) => a.displayOrder - b.displayOrder);

        this.articles = articles.sort(
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

  get tabCategories(): NewsCategory[] {
    return this.categories.slice(0, 6);
  }

  categoryName(id: number): string {
    return this.categories.find((c) => c.id === id)?.name || 'News';
  }

  categoryCount(id: number): number {
    return this.articles.filter((a) => a.newsCategoryId === id).length;
  }

  get filteredArticles(): NewsArticle[] {
    let result = this.articles;

    if (this.activeCategoryId !== null) {
      result = result.filter((a) => a.newsCategoryId === this.activeCategoryId);
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.shortDescription || '').toLowerCase().includes(q)
      );
    }

    return result;
  }

  get pagedArticles(): NewsArticle[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredArticles.slice(start, start + PAGE_SIZE);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.filteredArticles.length / PAGE_SIZE), 1);
  }

  get pageNumbers(): number[] {
    const pages = Math.min(this.totalPages, 5);
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  get trendingNow(): NewsArticle[] {
    return [...this.articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }

  selectCategory(id: number | null): void {
    this.activeCategoryId = id;
    this.currentPage = 1;
  }

  performSearch(): void {
    this.currentPage = 1;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  goToArticle(article: NewsArticle): void {
    this.router.navigate(['/news/article', article.slug]);
  }

  timeAgo(dateStr?: string | null): string {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  reads(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K reads`;
    return `${count} reads`;
  }
}
