import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CategoryNavigationService {
  private readonly categoryRouteMap: { [key: string]: string } = {
    vehicles: 'vehicles',
    electronics: 'electronics',
    'electronics-and-appliances': 'electronics',
    properties: 'properties',
    furniture: 'furniture',
    sports: 'sports',
    'sports-and-hobbies': 'sports',
    pets: 'pets',
    fashion: 'fashion',
    books: 'books',
    jobs: 'jobs',
    'commercial-services': 'commercial-services',
    'commercial-service': 'commercial-services',
    gadgets: 'gadgets',
  };

  constructor(private router: Router) {}

  normalizeCategoryName(name: string): string {
    return String(name || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getRouteSegment(categoryName: string): string {
    const normalized = this.normalizeCategoryName(categoryName);
    return this.categoryRouteMap[normalized] || normalized;
  }

  goToPostsListing(
    categoryName: string,
    subCategoryId?: number,
  ): Promise<boolean> {
    if (!categoryName) {
      return this.router.navigate(['/classified-ads']);
    }

    const routeSegment = this.getRouteSegment(categoryName);
    const target = ['/classified-ads', routeSegment, 'view-posts'];

    const queryParams: any = {};
    if (subCategoryId != null) queryParams.sub = subCategoryId;
    if (routeSegment) queryParams.type = routeSegment;

    return this.router.navigate(target, { queryParams }).catch((err) => {
      console.error('[CategoryNavigationService] Navigation failed', {
        target,
        queryParams,
        currentUrl: this.router.url,
        error: err,
      });
      return this.router.navigate(['/classified-ads']);
    });
  }
}
