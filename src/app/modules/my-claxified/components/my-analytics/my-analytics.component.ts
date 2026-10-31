import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessService } from 'src/app/modules/business/service/business.service';
import { BusinessOfferingDto } from 'src/app/modules/business/model/Business';
import { OfferingType } from 'src/app/modules/business/enum/business-offering.enum';

interface AnalyticsBusiness {
  id: number;
  name: string;
  logoUrl: string;
  location: string;
  subCategoryIds: number[];
}

interface ActiveBusiness {
  business: AnalyticsBusiness;
  offerings: BusinessOfferingDto[];
}

@Component({
  selector: 'app-my-analytics',
  templateUrl: './my-analytics.component.html',
  styleUrls: ['./my-analytics.component.css'],
})
export class MyAnalyticsComponent implements OnInit, OnDestroy {
  loading = true;
  loadFailed = false;

  businesses: AnalyticsBusiness[] = [];
  search = '';

  selectedId: number | null = null;

  active: ActiveBusiness | null = null;
  switching = false;

  private offeringsSub?: Subscription;

  constructor(
    private businessService: BusinessService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadBusinesses();
  }

  ngOnDestroy(): void {
    this.offeringsSub?.unsubscribe();
  }

  loadBusinesses(): void {
    const userId = Number(localStorage.getItem('id')) || 0;
    this.loading = true;
    this.loadFailed = false;

    if (!userId) {
      this.businesses = [];
      this.loading = false;
      return;
    }

    this.businessService.getUserBusinesses(userId).subscribe({
      next: (list) => {
        const items = list || [];
        if (!items.length) {
          this.businesses = [];
          this.loading = false;
          return;
        }

        forkJoin(
          items.map((b) =>
            this.businessService
              .getBusinessByGuid(b.businessId)
              .pipe(catchError(() => of(null))),
          ),
        ).subscribe((details) => {
          this.businesses = items
            .map((b, i) => {
              const d: any = details[i];
              const addr = d?.businessAddressDto;
              return {
                id: Number(d?.id) || 0,
                name: d?.businessName || b.businessName,
                logoUrl: (d?.logoUrl || b.logoUrl || '').trim(),
                location: addr
                  ? [addr.city, addr.state].filter((v: any) => !!v).join(', ')
                  : [b.area, b.city].filter((v) => !!v).join(', '),
                subCategoryIds: ((d?.businessSubCategoryIds || []) as any[])
                  .map(Number)
                  .filter((n) => n > 0),
              } as AnalyticsBusiness;
            })
            .filter((b) => b.id > 0)
            .sort((a, b) => b.id - a.id); // newest first
          this.loading = false;

          const wanted = Number(
            this.route.snapshot.queryParamMap.get('business'),
          );
          const first =
            this.businesses.find((b) => b.id === wanted) || this.businesses[0];
          if (first) this.select(first);
        });
      },
      error: () => {
        this.businesses = [];
        this.loading = false;
        this.loadFailed = true;
      },
    });
  }

  select(business: AnalyticsBusiness): void {
    if (this.selectedId === business.id && (this.active || this.switching)) {
      return;
    }
    this.selectedId = business.id;
    this.switching = true;
    this.offeringsSub?.unsubscribe();

    const queries: (number | null)[] = [null, ...business.subCategoryIds];

    this.offeringsSub = forkJoin(
      queries.map((subCategoryId) =>
        this.businessService
          .getBusinessOfferingsByBusinessId(business.id, subCategoryId, null)
          .pipe(catchError(() => of([] as BusinessOfferingDto[]))),
      ),
    ).subscribe((results) => {
      const byId = new Map<number, BusinessOfferingDto>();
      results.forEach((list) =>
        (list || []).forEach((o) => {
          if (
            Number(o.offeringType) !== Number(OfferingType.Product) &&
            Number(o.offeringType) !== Number(OfferingType.Service)
          ) {
            byId.set(o.id, o);
          }
        }),
      );

      this.active = { business, offerings: Array.from(byId.values()) };
      this.switching = false;
    });
  }

  get filteredBusinesses(): AnalyticsBusiness[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.businesses;
    return this.businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.location.toLowerCase().includes(term),
    );
  }

  clearSearch(): void {
    this.search = '';
  }

  trackById(_: number, b: AnalyticsBusiness): number {
    return b.id;
  }

  initials(name: string): string {
    return (name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }
}
