import { Observable, Subscription } from 'rxjs';
import { PagedPosts, PostsPageQuery } from '../model/PagedPosts';

export class ServerPagedPosts {
  items: any[] = [];
  hasMore = false;
  isLoadingFirst = false;
  isLoadingMore = false;
  error = false;

  private nextPage = 1;
  private subCategoryId = 0;
  private seen = new Set<any>();
  private loadedRaw = 0;
  private sub?: Subscription;
  private token = 0;

  constructor(
    private fetchPage: (query: PostsPageQuery) => Observable<PagedPosts>,
    private onChange: () => void,
    readonly pageSize: number = 20,
  ) {}

  start(subCategoryId: number = 0): void {
    this.cancel();
    this.items = [];
    this.seen.clear();
    this.loadedRaw = 0;
    this.nextPage = 1;
    this.subCategoryId = subCategoryId;
    this.hasMore = false;
    this.error = false;
    this.isLoadingFirst = true;
    this.isLoadingMore = false;
    this.request();
  }

  loadMore(): void {
    if (this.isLoadingFirst || this.isLoadingMore || !this.hasMore) return;
    this.error = false;
    this.isLoadingMore = true;
    this.request();
  }

  retry(): void {
    if (!this.error) return;
    if (this.items.length === 0 && this.nextPage === 1) {
      this.start(this.subCategoryId);
    } else {
      this.loadMore();
    }
  }

  cancel(): void {
    this.token++;
    this.sub?.unsubscribe();
    this.sub = undefined;
  }

  private request(): void {
    const token = ++this.token;
    this.sub?.unsubscribe();
    this.sub = this.fetchPage({
      pageIndex: this.nextPage,
      pageSize: this.pageSize,
      subCategoryId: this.subCategoryId,
    }).subscribe({
      next: (page) => {
        if (token !== this.token) return;
        const incoming = page.items || [];

        const fresh = incoming.filter((item: any) => {
          const key = ServerPagedPosts.keyOf(item);
          if (this.seen.has(key)) return false;
          this.seen.add(key);
          return true;
        });
        this.loadedRaw += fresh.length;

        const wanted = this.subCategoryId;
        const matching = wanted
          ? fresh.filter(
              (item: any) =>
                item?.subCategoryId == null ||
                Number(item.subCategoryId) === wanted,
            )
          : fresh;
        this.items = this.items.concat(matching);
        this.nextPage++;

        if (page.totalCount != null) {
          this.hasMore = fresh.length > 0 && this.loadedRaw < page.totalCount;
        } else {
          this.hasMore = fresh.length > 0 && incoming.length >= this.pageSize;
        }
        this.isLoadingFirst = false;
        this.isLoadingMore = false;
        this.onChange();
      },
      error: () => {
        if (token !== this.token) return;
        this.error = true;
        this.isLoadingFirst = false;
        this.isLoadingMore = false;
        this.onChange();
      },
    });
  }

  private static keyOf(item: any): string {
    const id = item?.tableRefGuid ?? item?.tabRefGuid ?? item?.id;
    if (id != null) return 'id:' + id;
    try {
      return 'json:' + JSON.stringify(item);
    } catch {
      return 'obj:' + Math.random();
    }
  }
}
