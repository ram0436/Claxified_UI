import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NewsService } from '../../service/news.service';
import { NewsArticle, NewsCategory } from '../../model/News';

interface CategoryTileVm {
  category: NewsCategory;
  articleCount: number;
  image: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
  bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80',
  karnataka: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80',
  india: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&q=80',
  business: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
  technology: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80',
};

@Component({
  selector: 'app-news-home',
  templateUrl: './news-home.component.html',
  styleUrls: ['./news-home.component.css'],
})
export class NewsHomeComponent implements OnInit {
  location = 'Bengaluru';
  searchQuery = '';

  categories: NewsCategory[] = [];
  categoriesLoading = true;
  categoriesError = false;

  articles: NewsArticle[] = [];
  articlesLoading = true;
  articlesError = false;

  quickFilters = [
    { icon: 'bolt', title: 'Top Headlines', subtitle: 'What\u2019s happening now', link: '/news/headlines' },
    { icon: 'place', title: 'Local News', subtitle: 'News from your city', link: '/news/categories/local' },
    { icon: 'flag', title: 'India', subtitle: 'National updates', link: '/news/categories/india' },
    { icon: 'bar_chart', title: 'Business', subtitle: 'Market & Economy', link: '/news/categories/business' },
    { icon: 'emoji_events', title: 'Sports', subtitle: 'Scores & Highlights', link: '/news/categories/sports' },
    { icon: 'more_horiz', title: 'More', subtitle: 'View all categories', link: '/news/categories' },
  ];

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchArticles();
  }

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = false;
    this.newsService.getCategories().subscribe({
      next: (data) => {
        // De-duplicate by slug, keep first occurrence (API sample returns dupes)
        const seen = new Set<string>();
        this.categories = data.filter((c) => {
          if (seen.has(c.slug)) return false;
          seen.add(c.slug);
          return true;
        }).sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 6);
        this.categoriesLoading = false;
      },
      error: () => {
        this.categoriesLoading = false;
        this.categoriesError = true;
      },
    });
  }

  fetchArticles(): void {
    this.articlesLoading = true;
    this.articlesError = false;
    this.newsService.getArticles().subscribe({
      next: (data) => {
        this.articles = data.sort(
          (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
        );
        this.articlesLoading = false;
      },
      error: () => {
        this.articlesLoading = false;
        this.articlesError = true;
      },
    });
  }

  get topStory(): NewsArticle | undefined {
    return this.articles.find((a) => a.isFeatured) || this.articles[0];
  }

  get headlineList(): NewsArticle[] {
    return this.articles.filter((a) => a.id !== this.topStory?.id).slice(0, 4);
  }

  get trendingNow(): NewsArticle[] {
    return [...this.articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }

  get editorsPicks(): NewsArticle[] {
    return this.articles.filter((a) => a.isFeatured || a.isTrending).slice(0, 5);
  }

  categoryImage(cat: NewsCategory): string {
    return CATEGORY_IMAGES[cat.slug] || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=80';
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/news/headlines'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  goToArticle(article: NewsArticle): void {
    this.router.navigate(['/news/article', article.slug]);
  }

  goToCategory(cat: NewsCategory): void {
    this.router.navigate(['/news/categories', cat.slug]);
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
