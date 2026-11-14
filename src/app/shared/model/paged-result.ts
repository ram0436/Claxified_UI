export interface PagedPostsQuery {
  pageIndex: number;
  pageSize: number;
  subCategoryId?: number | null;
}

export interface PagedPostsResult {
  items: any[];
  totalCount: number | null;
  pageIndex: number;
  pageSize: number;
}

export function normalizePagedPosts(
  res: any,
  query: PagedPostsQuery,
): PagedPostsResult {
  if (Array.isArray(res)) {
    return {
      items: res,
      totalCount: null,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    };
  }
  const total =
    res?.totalCount ?? res?.total ?? res?.totalRecords ?? res?.count ?? null;
  return {
    items: res?.items ?? res?.data ?? res?.results ?? [],
    totalCount: total == null ? null : Number(total),
    pageIndex: res?.pageIndex ?? query.pageIndex,
    pageSize: res?.pageSize ?? query.pageSize,
  };
}
