import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminDashboardService } from 'src/app/modules/admin/service/admin-dashboard.service';
import { CommonService } from '../service/common.service';
import {
  extractPostUniqueSlug,
  getCachedPostGuid,
  rememberPostGuids,
} from '../utils/post-url.util';

/**
 * Turns the short slug in  /classified-ads/{category}/{city}/{title}-{slug}
 * back into the full tabRefGuid that the post APIs need.
 *
 *  1. local cache (filled whenever a post link is built / a list is loaded) -> instant
 *  2. fallback: ads of the route's category (+ the user's own ads), matched by GUID prefix
 *
 * Route needs  data: { categoryId: <number> }
 * Resolves to the full GUID, or to '' if not found (the page then shows its normal "not found" state).
 */
@Injectable({ providedIn: 'root' })
export class PostGuidResolver implements Resolve<string> {
  constructor(
    private adminService: AdminDashboardService,
    private commonService: CommonService,
    private router: Router,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string> | string {
    const slug = extractPostUniqueSlug(route.paramMap.get('postSlug'));
    if (!slug) return '';

    const cached = getCachedPostGuid(slug);
    if (cached) return cached;

    const prefix = slug + '-';
    const matches = (g?: string | null) =>
      !!g && g.toLowerCase().startsWith(prefix);

    const categoryId = Number(route.data['categoryId']);
    const userId = Number(localStorage.getItem('id'));

    const byCategory$: Observable<string[]> = categoryId
      ? (this.adminService.getAdsByCategory(categoryId) as Observable<any>).pipe(
          map((list: any) => this.guidsOf(list)),
          catchError(() => of([] as string[])),
        )
      : of([]);

    const own$: Observable<string[]> = userId
      ? (this.commonService.getAllAdsByUserId(userId) as Observable<any>).pipe(
          map((list: any) => this.guidsOf(list)),
          catchError(() => of([] as string[])),
        )
      : of([]);

    return forkJoin([byCategory$, own$]).pipe(
      map(([a, b]) => {
        const all = [...a, ...b];
        rememberPostGuids(all);
        return all.find((g) => matches(g)) || '';
      }),
    );
  }

  /** API responses are either an array or { data: [...] } / nested per-category */
  private guidsOf(list: any): string[] {
    const out: string[] = [];
    const walk = (x: any) => {
      if (!x) return;
      if (Array.isArray(x)) return x.forEach(walk);
      if (typeof x === 'object') {
        const g = x.tableRefGuid || x.tabRefGuid || x.tabRefGUID;
        if (typeof g === 'string') out.push(g);
        else Object.values(x).forEach((v) => typeof v === 'object' && walk(v));
      }
    };
    walk(list);
    return out;
  }
}
