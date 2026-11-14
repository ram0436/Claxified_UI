export interface PostsPageQuery {
  pageIndex: number;
  pageSize: number;
  subCategoryId?: number | null;
}

export interface PagedPosts<T = any> {
  items: T[];
  totalCount: number | null;
  pageIndex: number;
  pageSize: number;
}

export function buildPostsPageParams(query: PostsPageQuery): {
  [key: string]: string;
} {
  const params: { [key: string]: string } = {
    pageIndex: String(query.pageIndex),
    pageSize: String(query.pageSize),
  };
  if (query.subCategoryId != null && Number(query.subCategoryId) !== 0) {
    params["subCategoryId"] = String(query.subCategoryId);
  }
  return params;
}

export function normalizePagedPosts(
  res: any,
  query: PostsPageQuery
): PagedPosts {
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
