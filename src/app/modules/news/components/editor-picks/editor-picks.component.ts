import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NewsService } from '../../service/news.service';
import { NewsArticle, NewsCategory } from '../../model/News';

type DateFilter = 'all' | '24h' | '7d' | '30d';

@Component({
  selector: 'app-editor-picks',
  templateUrl: './editor-picks.component.html',
  styleUrls: ['./editor-picks.component.css'],
})
export class EditorPicksComponent implements OnInit {
  categories: NewsCategory[] = [];
  picks: NewsArticle[] = [];

  loading = true;
  error = false;

  activeCategoryId: number | null = null;
  activeDateFilter: DateFilter = 'all';

  currentPage = 1;
  itemsPerPage = 24;
  itemsPerPageOptions = [12, 24, 48, 50];

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.fetchPicks();
  }

  fetchPicks(): void {
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

        // Editor's picks = featured or trending articles (no dedicated flag in API)
        this.picks = articles
          .filter((a) => a.isFeatured || a.isTrending)
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

  categoryName(id: number): string {
    return this.categories.find((c) => c.id === id)?.name || '';
  }

  get filteredPicks(): NewsArticle[] {
    let result = this.picks;

    if (this.activeCategoryId !== null) {
      result = result.filter((a) => a.newsCategoryId === this.activeCategoryId);
    }

    if (this.activeDateFilter !== 'all') {
      const hoursMap: Record<Exclude<DateFilter, 'all'>, number> = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30,
      };
      const cutoffMs = Date.now() - hoursMap[this.activeDateFilter] * 3600000;
      result = result.filter((a) => new Date(a.publishedAt || a.createdAt).getTime() >= cutoffMs);
    }

    return result;
  }

  get pagedPicks(): NewsArticle[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPicks.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.filteredPicks.length / this.itemsPerPage), 1);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  categoryCount(categoryId: number): number {
    return this.picks.filter((a) => a.newsCategoryId === categoryId).length;
  }

  selectCategory(id: number | null): void {
    this.activeCategoryId = id;
    this.currentPage = 1;
  }

  selectDateFilter(filter: DateFilter): void {
    this.activeDateFilter = filter;
    this.currentPage = 1;
  }

  onItemsPerPageChange(): void {
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
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }

  get rangeStart(): number {
    return this.filteredPicks.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredPicks.length);
  }
}
