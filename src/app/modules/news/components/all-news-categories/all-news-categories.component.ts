import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NewsService } from '../../service/news.service';
import { NewsCategory } from '../../model/News';

const CATEGORY_IMAGES: Record<string, string> = {
  'top-headlines': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80',
  'local-news': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80',
  'local': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80',
  india: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&q=80',
  world: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
  business: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
  technology: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
  lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80',
  education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
  science: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
  environment: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',
  politics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&q=80',
  economy: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  others: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=80',
};

const CATEGORY_ICONS: Record<string, string> = {
  'top-headlines': 'apartment',
  local: 'location_on',
  india: 'flag',
  world: 'public',
  business: 'bar_chart',
  sports: 'emoji_events',
  technology: 'memory',
  entertainment: 'movie',
  lifestyle: 'spa',
  health: 'favorite',
  education: 'school',
  science: 'science',
  environment: 'eco',
  politics: 'account_balance',
  economy: 'trending_up',
  others: 'more_horiz',
};

@Component({
  selector: 'app-all-news-categories',
  templateUrl: './all-news-categories.component.html',
  styleUrls: ['./all-news-categories.component.css'],
})
export class AllNewsCategoriesComponent implements OnInit {
  categories: NewsCategory[] = [];
  filteredCategories: NewsCategory[] = [];
  loading = true;
  error = false;
  searchQuery = '';
  email = '';

  socialLinks = [
    { icon: 'facebook', link: 'https://facebook.com' },
    { icon: 'x', link: 'https://x.com' },
    { icon: 'instagram', link: 'https://instagram.com' },
    { icon: 'youtube', link: 'https://youtube.com' },
    { icon: 'linkedin', link: 'https://linkedin.com' },
  ];

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.loading = true;
    this.error = false;
    this.newsService.getCategories().subscribe({
      next: (data) => {
        const seen = new Set<string>();
        this.categories = data
          .filter((c) => {
            if (seen.has(c.slug)) return false;
            seen.add(c.slug);
            return true;
          })
          .sort((a, b) => a.displayOrder - b.displayOrder);
        this.filteredCategories = this.categories;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  get popularCategories(): NewsCategory[] {
    return this.categories.slice(0, 5);
  }

  onSearchChange(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredCategories = !q
      ? this.categories
      : this.categories.filter((c) => c.name.toLowerCase().includes(q));
  }

  categoryImage(cat: NewsCategory): string {
    return CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES['others'];
  }

  categoryIcon(cat: NewsCategory): string {
    return CATEGORY_ICONS[cat.slug] || 'label';
  }

  // Article counts aren't part of the categories API response; this is a
  // placeholder heuristic until a real count endpoint is exposed.
  articleCount(cat: NewsCategory): string {
    const base = ((cat.id * 37) % 900) + 300;
    return `${base}+ Articles`;
  }

  goToCategory(cat: NewsCategory): void {
    this.router.navigate(['/news/categories', cat.slug]);
  }

  subscribe(): void {
    this.email = '';
  }
}
