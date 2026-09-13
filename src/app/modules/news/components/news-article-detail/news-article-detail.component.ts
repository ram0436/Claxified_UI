import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../service/news.service';
import { NewsArticle, NewsArticleDetail } from '../../model/News';

@Component({
  selector: 'app-news-article-detail',
  templateUrl: './news-article-detail.component.html',
  styleUrls: ['./news-article-detail.component.css'],
})
export class NewsArticleDetailComponent implements OnInit {
  article?: NewsArticleDetail;
  articleId?: number;
  loading = true;
  error = false;

  relatedArticles: NewsArticle[] = [];
  trendingNow: NewsArticle[] = [];
  email = '';

  socialLinks = [
    { icon: 'chat', link: 'https://wa.me/', className: 'whatsapp' },
    { icon: 'close', link: 'https://x.com/intent/tweet', className: 'x' },
    { icon: 'facebook', link: 'https://facebook.com/sharer', className: 'facebook' },
    { icon: 'work', link: 'https://linkedin.com/sharing', className: 'linkedin' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') || '';
      this.loadArticle(slug);
    });
  }

  loadArticle(slug: string): void {
    this.loading = true;
    this.error = false;

    // The detail endpoint only accepts an id, so resolve the slug -> id
    // via the article list first, then fetch the flattened detail record.
    this.newsService.getArticles().subscribe({
      next: (allArticles) => {
        const match = allArticles.find((a) => a.slug === slug);
        if (!match) {
          this.loading = false;
          this.error = true;
          return;
        }

        this.articleId = match.id;

        this.newsService.getArticleById(match.id).subscribe({
          next: (detail) => {
            this.article = detail;
            this.loading = false;

            this.relatedArticles = allArticles
              .filter((a) => a.newsCategoryId === match.newsCategoryId && a.id !== match.id)
              .sort(
                (a, b) =>
                  new Date(b.publishedAt || b.createdAt).getTime() -
                  new Date(a.publishedAt || a.createdAt).getTime()
              )
              .slice(0, 5);

            this.trendingNow = [...allArticles]
              .sort((a, b) => b.viewCount - a.viewCount)
              .slice(0, 5);
          },
          error: () => {
            this.loading = false;
            this.error = true;
          },
        });
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  get contentParagraphs(): string[] {
    if (!this.article?.content) return [];
    return this.article.content
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
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

  formattedDate(dateStr?: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  reads(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K reads`;
    return `${count} reads`;
  }

  subscribe(): void {
    this.email = '';
  }
}
