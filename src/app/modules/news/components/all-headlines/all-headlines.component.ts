import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class AllHeadlinesComponent implements OnInit, OnDestroy {
  categories: NewsCategory[] = [];
  articles: NewsArticle[] = [];

  loading = true;
  error = false;

  searchQuery = '';
  location = 'Bengaluru';
  activeCategoryId: number | null = null; // null = "All News"
  currentPage = 1;

  popularTopics = [
    'Bengaluru',
    'Startup',
    'Metro',
    'Real Estate',
    'Gold Price',
    'Monsoon',
    'IPL 2026',
    'Budget',
    'AI',
    'Electric Vehicles',
  ];

  socialLinks = [
    { icon: 'facebook', link: 'https://facebook.com' },
    { icon: 'x', link: 'https://x.com' },
    { icon: 'instagram', link: 'https://instagram.com' },
    { icon: 'youtube', link: 'https://youtube.com' },
    { icon: 'linkedin', link: 'https://linkedin.com' },
  ];

  // ---- Trending rotation state ----
  trendingIndex = 0;
  trendingAnimating = false;
  private trendingTimer: any = null;
  private trendingSource: NewsArticle[] = [];
  private readonly TRENDING_WINDOW_SIZE = 5;
  private readonly TRENDING_INTERVAL_MS = 4000;
  private readonly TRENDING_ANIMATION_MS = 600;

  constructor(
    private newsService: NewsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('q') || '';
    });
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.stopTrendingAutoPlay();
  }

  /** Full list sorted once, then reused — avoids re-sorting on every CD cycle. */
  private get trendingSorted(): NewsArticle[] {
    if (this.trendingSource.length === 0 && this.articles.length > 0) {
      this.trendingSource = [...this.articles].sort((a, b) => {
        const views = (b.viewCount ?? 0) - (a.viewCount ?? 0);
        if (views !== 0) return views;

        const trending = Number(b.isTrending) - Number(a.isTrending);
        if (trending !== 0) return trending;

        return (
          this.toTime(b.publishedAt || b.createdAt) -
          this.toTime(a.publishedAt || a.createdAt)
        );
      });
    }
    return this.trendingSource;
  }

  /** Sliding window of TRENDING_WINDOW_SIZE items, wrapping around. */
  get trendingNow(): NewsArticle[] {
    const all = this.trendingSorted;
    const n = all.length;
    if (n === 0) return [];
    if (n <= this.TRENDING_WINDOW_SIZE) return all;

    const result: NewsArticle[] = [];
    for (let i = 0; i < this.TRENDING_WINDOW_SIZE; i++) {
      result.push(all[(this.trendingIndex + i) % n]);
    }
    return result;
  }

  /** Number of distinct slide positions (0 = no rotation needed). */
  get trendingDotCount(): number {
    const n = this.trendingSorted.length;
    return n <= this.TRENDING_WINDOW_SIZE ? 0 : n;
  }

  nextTrending(): void {
    const n = this.trendingSorted.length;
    if (n <= this.TRENDING_WINDOW_SIZE) return;

    this.trendingAnimating = true;
    setTimeout(() => {
      this.trendingIndex = (this.trendingIndex + 1) % n;
      setTimeout(() => (this.trendingAnimating = false), 20);
    }, this.TRENDING_ANIMATION_MS);
  }

  startTrendingAutoPlay(): void {
    this.stopTrendingAutoPlay();
    if (this.trendingSorted.length <= this.TRENDING_WINDOW_SIZE) return;
    this.trendingTimer = setInterval(
      () => this.nextTrending(),
      this.TRENDING_INTERVAL_MS,
    );
  }

  stopTrendingAutoPlay(): void {
    if (this.trendingTimer) {
      clearInterval(this.trendingTimer);
      this.trendingTimer = null;
    }
  }

  goToTrending(index: number, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.trendingIndex = index;
    this.startTrendingAutoPlay();
  }

  trackByArticleId(_index: number, a: NewsArticle): number {
    return a.id;
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
            new Date(a.publishedAt || a.createdAt).getTime(),
        );

        this.trendingIndex = 0;
        this.trendingSource = [];
        void this.trendingSorted;
        this.startTrendingAutoPlay();

        this.loading = false;

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
          (a.shortDescription || '').toLowerCase().includes(q),
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

  private toTime(d?: string | null): number {
    if (!d) return 0;
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
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
