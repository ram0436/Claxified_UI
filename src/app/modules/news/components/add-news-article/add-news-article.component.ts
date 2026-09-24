import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { NewsService } from '../../service/news.service';
import {
  NewsArticle,
  NewsAuthor,
  NewsCategory,
  NewsSource,
  NewsSubCategory,
} from '../../model/News';
import { ArticleStatus, ArticleType } from '../../enum/news.enum';

interface OptionVm {
  value: number;
  label: string;
}

@Component({
  selector: 'app-add-news-article',
  templateUrl: './add-news-article.component.html',
  styleUrls: ['./add-news-article.component.css'],
})
export class AddNewsArticleComponent implements OnInit {
  // Lookups
  categories: NewsCategory[] = [];
  subCategories: NewsSubCategory[] = [];
  filteredSubCategories: NewsSubCategory[] = [];
  sources: NewsSource[] = [];
  authors: NewsAuthor[] = [];

  lookupsLoading = true;
  lookupsError = false;

  // Enum options exposed to template
  articleTypeOptions: OptionVm[] = [
    { value: ArticleType.Standard, label: 'Standard' },
    { value: ArticleType.Breaking, label: 'Breaking News' },
    { value: ArticleType.Featured, label: 'Featured' },
    { value: ArticleType.Video, label: 'Video' },
    { value: ArticleType.Photo, label: 'Photo Gallery' },
  ];

  // Form model
  model: {
    newsCategoryId: number | null;
    newsSubCategoryId: number | null;
    newsSourceId: number | null;
    newsAuthorId: number | null;
    title: string;
    slug: string;
    slugTouched: boolean;
    shortDescription: string;
    content: string;
    articleType: ArticleType;
    featuredImageUrl: string;
    featuredImageAltText: string;
    status: ArticleStatus;
    isFeatured: boolean;
    isBreaking: boolean;
    isTrending: boolean;
    readingTimeMinutes: number | null;
  } = {
    newsCategoryId: null,
    newsSubCategoryId: null,
    newsSourceId: null,
    newsAuthorId: null,
    title: '',
    slug: '',
    slugTouched: false,
    shortDescription: '',
    content: '',
    articleType: ArticleType.Standard,
    featuredImageUrl: '',
    featuredImageAltText: '',
    status: ArticleStatus.Draft,
    isFeatured: false,
    isBreaking: false,
    isTrending: false,
    readingTimeMinutes: 3,
  };

  submitting = false;

  private contentEditorEl?: HTMLDivElement;

  @ViewChild('contentEditor')
  set contentEditorRef(ref: ElementRef<HTMLDivElement> | undefined) {
    this.contentEditorEl = ref?.nativeElement;
    if (this.contentEditorEl) {
      this.contentEditorEl.innerHTML = this.model.content || '';
    }
  }

  constructor(
    private newsService: NewsService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.fetchLookups();
  }

  fetchLookups(): void {
    this.lookupsLoading = true;
    this.lookupsError = false;

    forkJoin({
      categories: this.newsService.getCategories(),
      subCategories: this.newsService.getSubCategories(),
      sources: this.newsService.getSources(),
      authors: this.newsService.getAuthors(),
    }).subscribe({
      next: ({ categories, subCategories, sources, authors }) => {
        const seen = new Set<string>();
        this.categories = (categories || [])
          .filter((c) => c.isActive)
          .filter((c) => {
            if (seen.has(c.slug)) return false;
            seen.add(c.slug);
            return true;
          })
          .sort((a, b) => a.displayOrder - b.displayOrder);

        this.subCategories = (subCategories || []).filter((s) => s.isActive);
        this.sources = (sources || []).filter((s) => s.isActive);
        this.authors = (authors || []).filter((a) => a.isActive);
        this.lookupsLoading = false;
      },
      error: () => {
        this.lookupsLoading = false;
        this.lookupsError = true;
      },
    });
  }

  onCategoryChange(): void {
    this.model.newsSubCategoryId = null;
    this.filteredSubCategories = this.model.newsCategoryId
      ? this.subCategories.filter(
          (s) => s.newsCategoryId === this.model.newsCategoryId,
        )
      : [];
  }

  onTitleChange(): void {
    if (!this.model.slugTouched) {
      this.model.slug = this.slugify(this.model.title);
    }
  }

  onSlugEdited(): void {
    this.model.slugTouched = true;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ---------- RTE ----------
  exec(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
    this.contentEditorEl?.focus();
    if (this.contentEditorEl) {
      this.onContentInput(this.contentEditorEl);
    }
  }

  insertLink(): void {
    const url = window.prompt('Enter a URL');
    if (url) {
      this.exec('createLink', url);
    }
  }

  onContentInput(el: HTMLDivElement): void {
    this.model.content = el.textContent?.trim() ? el.innerHTML : '';
    // Auto-estimate reading time when content changes
    const words = (el.textContent || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    this.model.readingTimeMinutes = Math.max(1, Math.round(words / 200));
  }

  // ---------- Validation ----------
  getMissingFields(): string[] {
    const m = this.model;
    const missing: string[] = [];

    if (!m.title.trim()) missing.push('Title');
    if (!m.slug.trim()) missing.push('URL Slug');
    if (!m.newsCategoryId) missing.push('Category');
    if (!m.newsSubCategoryId) missing.push('Sub-Category');
    if (!m.newsSourceId) missing.push('Source');
    if (!m.newsAuthorId) missing.push('Author');
    if (!m.content.trim()) missing.push('Content');
    if (!m.featuredImageUrl.trim()) missing.push('Featured Image URL');

    return missing;
  }

  get isFormValid(): boolean {
    return this.getMissingFields().length === 0;
  }

  // ---------- Submit ----------
  submit(publish: boolean): void {
    const missing = this.getMissingFields();
    if (missing.length > 0) {
      this.showNotification(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    this.submitting = true;

    const now = new Date().toISOString();

    const payload: Partial<NewsArticle> = {
      newsCategoryId: this.model.newsCategoryId!,
      newsSubCategoryId: this.model.newsSubCategoryId!,
      newsSourceId: this.model.newsSourceId!,
      newsAuthorId: this.model.newsAuthorId!,
      title: this.model.title.trim(),
      slug: this.model.slug.trim(),
      shortDescription: this.model.shortDescription.trim(),
      content: this.model.content.trim(),
      articleType: this.model.articleType,
      featuredImageUrl: this.model.featuredImageUrl.trim(),
      featuredImageAltText:
        this.model.featuredImageAltText.trim() || this.model.title.trim(),
      status: publish ? ArticleStatus.Published : ArticleStatus.Draft,
      publishedAt: publish ? now : null,
      isFeatured: this.model.isFeatured,
      isBreaking: this.model.isBreaking,
      isTrending: this.model.isTrending,
      displayOrder: 0,
      viewCount: 0,
      shareCount: 0,
      readingTimeMinutes: this.model.readingTimeMinutes || 3,
      createdAt: now,
      updatedAt: now,
      newsArticleSEO: {
        metaTitle: this.model.title.trim(),
        metaDescription: this.model.shortDescription.trim(),
        ogTitle: this.model.title.trim(),
        ogDescription: this.model.shortDescription.trim(),
        ogImageUrl: this.model.featuredImageUrl.trim(),
      },
      newsArticleMediaList: [],
      newsArticleTagList: [],
      newsArticleLocationList: [],
      relatedArticleList: [],
    };

    this.newsService.createArticle(payload).subscribe({
      next: (created) => {
        this.submitting = false;
        this.showNotification(
          publish ? 'Article published successfully' : 'Article saved as draft',
        );
        const slug = created?.slug || this.model.slug;
        setTimeout(() => {
          this.router.navigate(['/news/article', slug]);
        }, 800);
      },
      error: () => {
        this.submitting = false;
        this.showNotification(
          "We couldn't publish your article right now. Please try again.",
        );
      },
    });
  }

  resetForm(): void {
    this.model = {
      newsCategoryId: null,
      newsSubCategoryId: null,
      newsSourceId: null,
      newsAuthorId: null,
      title: '',
      slug: '',
      slugTouched: false,
      shortDescription: '',
      content: '',
      articleType: ArticleType.Standard,
      featuredImageUrl: '',
      featuredImageAltText: '',
      status: ArticleStatus.Draft,
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      readingTimeMinutes: 3,
    };
    this.filteredSubCategories = [];
    if (this.contentEditorEl) {
      this.contentEditorEl.innerHTML = '';
    }
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
