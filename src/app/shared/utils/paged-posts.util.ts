import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  normalizePagedPosts,
  PagedPostsQuery,
  PagedPostsResult,
} from '../model/paged-result';

export function getPagedPosts(
  http: HttpClient,
  url: string,
  query: PagedPostsQuery,
): Observable<PagedPostsResult> {
  let params = new HttpParams()
    .set('pageIndex', String(query.pageIndex))
    .set('pageSize', String(query.pageSize));
  if (query.subCategoryId) {
    params = params.set('subCategoryId', String(query.subCategoryId));
  }
  return http
    .get<any>(url, { params })
    .pipe(map((res) => normalizePagedPosts(res, query)));
}
