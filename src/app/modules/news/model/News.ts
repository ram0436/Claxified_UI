import { ArticleStatus, ArticleType, NewsLocationType, NewsMediaType, NewsRelationType, NewsSourceType } from '../enum/news.enum';

// ==========================================================
// Lookup / master entities
// ==========================================================

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface NewsSubCategory {
  id: number;
  newsCategoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface NewsSource {
  id: number;
  name: string;
  slug: string;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  sourceType: NewsSourceType | number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsAuthor {
  id: number;
  name: string;
  slug: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  designation?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsLocation {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  locationType: NewsLocationType | number;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================================
// Article sub-entities
// ==========================================================

export interface NewsArticleTag {
  id: number;
  newsArticleId: number;
  newsTagId: number;
  createdAt?: string;
}

export interface NewsArticleMedia {
  id: number;
  newsArticleId: number;
  mediaType: NewsMediaType | number;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  credit?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsArticleSEO {
  id?: number;
  newsArticleId?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  robots?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsArticleLocation {
  id: number;
  newsArticleId: number;
  newsLocationId: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface RelatedNewsArticle {
  id: number;
  newsArticleId: number;
  relatedNewsArticleId: number;
  relationType: NewsRelationType | number;
  displayOrder: number;
  createdAt?: string;
}

export interface NewsArticleRevision {
  id: number;
  newsArticleId: number;
  revisionNumber: number;
  title: string;
  shortDescription?: string | null;
  content?: string | null;
  revisionReason?: string | null;
  createdBy?: number;
  createdAt?: string;
}

export interface NewsArticleAnalytics {
  id?: number;
  newsArticleId?: number;
  analyticsDate?: string;
  views?: number;
  uniqueViews?: number;
  shares?: number;
  averageReadTimeSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================================
// Main article entity - matches list/create response shape
// (GET /News/news-article, POST /News/news-article)
// ==========================================================

export interface NewsArticle {
  id: number;
  newsCategoryId: number;
  newsSubCategoryId: number;
  newsSourceId: number;
  newsAuthorId: number;
  title: string;
  slug: string;
  shortDescription?: string | null;
  content?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAltText?: string | null;
  status: ArticleStatus | number;
  articleType: ArticleType | number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
  displayOrder: number;
  viewCount: number;
  shareCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  contentSourceUrl?: string | null;

  // Optional nested payload, used only when creating/updating a full article
  newsArticleAnalytics?: NewsArticleAnalytics;
  newsArticleSEO?: NewsArticleSEO;
  newsArticleTagList?: NewsArticleTag[];
  newsArticleMediaList?: NewsArticleMedia[];
  newsArticleLocationList?: NewsArticleLocation[];
  relatedArticleList?: RelatedNewsArticle[];
  newsArticleRevisionList?: NewsArticleRevision[];
}

// ==========================================================
// Flattened article detail - matches
// GET /News/news-article/articleId?articleId={id}
// ==========================================================

export interface NewsArticleDetail {
  newsCategory: string;
  newsSubCategory: string;
  newsSource: string;
  newsAuthor: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  content?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAltText?: string | null;
  status: ArticleStatus | number;
  articleType: ArticleType | number;
  publishedAt?: string | null;
  viewCount: number;
  shareCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  contentSourceUrl?: string | null;
}

// ==========================================================
// UI view-model helpers (not part of the API, used by components)
// ==========================================================

export interface NewsCategoryCardVm {
  category: NewsCategory;
  articleCount?: number;
  imageUrl?: string;
  icon?: string;
  colorClass?: string;
}

export interface EditorPickFilterVm {
  label: string;
  count: number;
  slug?: string;
}
