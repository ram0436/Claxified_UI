import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BusinessService } from 'src/app/modules/business/service/business.service';
import { OfferingWishlistService } from 'src/app/modules/business/service/offering-wishlist.service';
import { buildBusinessCommands } from '../../../business/utils/business-url.util';
import { Observable } from 'rxjs';
import {
  BusinessDirectoryItem,
  BusinessOfferingDto,
  BusinessProductDto,
  BusinessServiceDto,
  OFFERING_TYPE_OPTIONS,
} from 'src/app/modules/business/model/Business';
import { OfferingType } from 'src/app/modules/business/enum/business-offering.enum';

type Mode = 'saved' | 'wishlist';
type WishTab = 'businesses' | 'offerings';

interface BizVm {
  businessId: number;
  guid: string;
  name: string;
  logo: string;
  category: string;
  location: string;
  found: boolean;
  city: string;
  area: string;
}

interface OfferingVm {
  id: number;
  kind: 'product' | 'service' | 'offering';
  name: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  priceOnRequest: boolean;
  priceUnit: string;
  imageUrl: string;
  typeLabel: string;
  offering?: BusinessOfferingDto;
}

const FALLBACK_IMG = '../../../../../assets/image_not_available.jpg';

@Component({
  selector: 'app-saved-items',
  templateUrl: './saved-items.component.html',
  styleUrls: ['./saved-items.component.css'],
})
export class SavedItemsComponent implements OnInit {
  mode: Mode = 'saved';
  activeTab: WishTab = 'businesses';
  isLoading = true;
  userId = 0;
  searchTerm = '';

  businesses: BizVm[] = [];
  offerings: OfferingVm[] = [];

  private busy = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private wishlist: OfferingWishlistService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['mode'] as Mode) || 'saved';
    this.userId = Number(localStorage.getItem('id')) || 0;
    this.load();
  }

  // ---------- Labels ----------

  get title(): string {
    return this.mode === 'saved' ? 'Saved Businesses' : 'Wishlist';
  }

  get subtitle(): string {
    return this.mode === 'saved'
      ? 'Businesses you saved to come back to later.'
      : 'Businesses and offerings you wishlisted.';
  }

  get showingBusinesses(): boolean {
    return this.mode === 'saved' || this.activeTab === 'businesses';
  }

  setTab(tab: WishTab): void {
    this.activeTab = tab;
    this.searchTerm = '';
  }

  // ---------- Loading ----------

  private load(): void {
    if (!this.userId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;

    const directory$ = this.businessService
      .getBusinessList()
      .pipe(catchError(() => of([] as BusinessDirectoryItem[])));

    if (this.mode === 'saved') {
      forkJoin({
        dir: directory$,
        recs: this.businessService
          .getSavedBusinesses(this.userId)
          .pipe(catchError(() => of([]))),
      }).subscribe(({ dir, recs }) => {
        this.businesses = this.toBizVms(
          (recs || []).filter((r) => !r.isDeleted).map((r) => r.businessId),
          dir,
        );
        this.isLoading = false;
      });
      return;
    }

    forkJoin({
      dir: directory$,
      biz: this.businessService
        .getWishlistBusinesses(this.userId)
        .pipe(catchError(() => of([]))),
      off: this.businessService
        .getWishlistOfferings(this.userId)
        .pipe(catchError(() => of([]))),
    })
      .pipe(
        switchMap(({ dir, biz, off }) => {
          this.businesses = this.toBizVms(
            (biz || []).filter((r) => !r.isDeleted).map((r) => r.businessId),
            dir,
          );

          const ids = (off || [])
            .filter((r) => !r.isDeleted)
            .map((r) => r.businessOfferingId);

          if (!ids.length) return of([] as (OfferingVm | null)[]);

          return forkJoin(ids.map((id) => this.resolveOffering(id)));
        }),
      )
      .subscribe((vms) => {
        this.offerings = (vms || []).filter((v): v is OfferingVm => !!v);
        this.isLoading = false;
      });
  }

  private resolveOffering(id: number): Observable<OfferingVm | null> {
    return this.businessService.getBusinessOfferingById(id).pipe(
      map((res: any) => (Array.isArray(res) ? res[0] : res) ?? null),
      catchError(() => of(null)),
      switchMap((o: BusinessOfferingDto | null) => {
        const type = o ? Number(o.offeringType) : 0;

        if (type === Number(OfferingType.Product)) {
          return this.fetchProduct(id, o);
        }
        if (type === Number(OfferingType.Service)) {
          return this.fetchService(id, o);
        }
        if (o) return of(this.toOfferingVm(o));

        // No parent record found: the id may belong to a product or service.
        return this.fetchProduct(id, null).pipe(
          switchMap((v) => (v ? of(v) : this.fetchService(id, null))),
        );
      }),
    );
  }

  private fetchProduct(
    id: number,
    fallback: BusinessOfferingDto | null,
  ): Observable<OfferingVm | null> {
    const fb = () => (fallback ? this.toOfferingVm(fallback) : null);
    return this.businessService.getBusinessProductDetails(id).pipe(
      map((p) => (p ? this.productToVm(p) : fb())),
      catchError(() => of(fb())),
    );
  }

  private fetchService(
    id: number,
    fallback: BusinessOfferingDto | null,
  ): Observable<OfferingVm | null> {
    const fb = () => (fallback ? this.toOfferingVm(fallback) : null);
    return this.businessService.getBusinessServiceDetails(id).pipe(
      map((s) => (s ? this.serviceToVm(s) : fb())),
      catchError(() => of(fb())),
    );
  }

  private productToVm(p: BusinessProductDto): OfferingVm {
    const img = p.images?.find((i) => i.isPrimary) || p.images?.[0];
    const disc = p.discountPercentage || 0;
    const final = disc ? Math.round(p.price - (p.price * disc) / 100) : p.price;
    return {
      id: p.id,
      kind: 'product',
      name: p.name,
      price: final,
      originalPrice: p.price,
      discountPercentage: disc,
      priceOnRequest: p.priceOnRequest === 'Yes',
      priceUnit: p.priceUnit || '',
      imageUrl: img?.imageUrl || FALLBACK_IMG,
      typeLabel: 'Product',
    };
  }

  private serviceToVm(s: BusinessServiceDto): OfferingVm {
    const img = s.images?.find((i) => i.isPrimary) || s.images?.[0];
    const unitMap: Record<string, string> = {
      StartingFrom: 'Starting',
      PriceRange: 'Range',
      Hourly: '/hr',
      Daily: '/day',
    };
    return {
      id: s.id,
      kind: 'service',
      name: s.serviceName,
      price: s.minimumPrice || 0,
      originalPrice: s.minimumPrice || 0,
      discountPercentage: 0,
      priceOnRequest: s.pricingType === 'CustomQuote',
      priceUnit: unitMap[s.pricingType] || '',
      imageUrl: img?.imageUrl || FALLBACK_IMG,
      typeLabel: 'Service',
    };
  }

  private toOfferingVm(o: BusinessOfferingDto): OfferingVm {
    return {
      id: o.id,
      kind: 'offering',
      name: o.name,
      price: o.price,
      originalPrice: o.price,
      discountPercentage: 0,
      priceOnRequest: !(o.price > 0),
      priceUnit: '',
      imageUrl: o.imageUrl || FALLBACK_IMG,
      typeLabel:
        OFFERING_TYPE_OPTIONS.find(
          (t) => Number(t.value) === Number(o.offeringType),
        )?.label || 'Offering',
      offering: o,
    };
  }

  private toBizVms(ids: number[], dir: BusinessDirectoryItem[]): BizVm[] {
    const byId = new Map<number, BusinessDirectoryItem>();
    (dir || []).forEach((d) => byId.set(d.id, d));

    return ids.map((id) => {
      const d = byId.get(id);
      const addr = d?.businessAddressDto;
      return {
        businessId: id,
        guid: d?.tabRefGUID || '',
        name: d?.businessName || 'Business no longer available',
        logo:
          d?.logoUrl?.trim() ||
          d?.coverImageUrl?.trim() ||
          d?.businessGalleryDtoList?.[0]?.imageUrl ||
          FALLBACK_IMG,
        category: d?.businessCategory || '',
        location: addr
          ? [addr.city, addr.state].filter((v) => !!v).join(', ')
          : '',
        city: addr?.city || '',
        area: addr?.area || '',
        found: !!d,
      };
    });
  }

  // ---------- Filtering ----------

  get filteredBusinesses(): BizVm[] {
    const t = this.searchTerm.trim().toLowerCase();
    if (!t) return this.businesses;
    return this.businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(t) ||
        b.category.toLowerCase().includes(t) ||
        b.location.toLowerCase().includes(t),
    );
  }

  get filteredOfferings(): OfferingVm[] {
    const t = this.searchTerm.trim().toLowerCase();
    if (!t) return this.offerings;
    return this.offerings.filter(
      (o) =>
        o.name.toLowerCase().includes(t) ||
        o.typeLabel.toLowerCase().includes(t),
    );
  }

  // ---------- Actions ----------

  isBusy(key: string): boolean {
    return this.busy.has(key);
  }

  openBusiness(b: BizVm): void {
    if (!b.found || !b.guid) return;
    const cmds = buildBusinessCommands({
      businessId: b.guid,
      businessName: b.name,
      city: b.city,
      area: b.area,
    } as any);
    this.router.navigate(cmds ?? ['/business/profile', b.guid]);
  }

  openOffering(o: OfferingVm): void {
    if (o.kind === 'product') {
      this.router.navigate(['/business/product', o.id], {
        state: { isOwner: false },
      });
    } else if (o.kind === 'service') {
      this.router.navigate(['/business/service', o.id], {
        state: { isOwner: false },
      });
    } else {
      this.router.navigate(['/business/offering', o.id], {
        state: { isOwner: false, offering: o.offering },
      });
    }
  }

  removeBusiness(b: BizVm, event: Event): void {
    event.stopPropagation();
    const key = `b:${b.businessId}`;
    if (this.busy.has(key)) return;

    const snapshot = [...this.businesses];
    this.businesses = this.businesses.filter(
      (x) => x.businessId !== b.businessId,
    ); // optimistic
    this.busy.add(key);

    const call$ =
      this.mode === 'saved'
        ? this.businessService.unsaveBusiness(this.userId, b.businessId)
        : this.businessService.removeBusinessFromWishlist(
            this.userId,
            b.businessId,
          );

    call$.subscribe(
      () => {
        this.busy.delete(key);
        this.notify(
          this.mode === 'saved'
            ? 'Removed from saved businesses'
            : 'Removed from wishlist',
        );
      },
      () => {
        this.businesses = snapshot; // revert
        this.busy.delete(key);
        this.notify('Something went wrong. Please try again.');
      },
    );
  }

  removeOffering(o: OfferingVm, event: Event): void {
    event.stopPropagation();
    const key = `o:${o.id}`;
    if (this.busy.has(key)) return;

    const snapshot = [...this.offerings];
    this.offerings = this.offerings.filter((x) => x.id !== o.id); // optimistic
    this.busy.add(key);

    this.businessService
      .removeOfferingFromWishlist(this.userId, o.id)
      .subscribe(
        () => {
          this.busy.delete(key);
          this.wishlist.load(true); // keep hearts elsewhere in sync
          this.notify('Removed from wishlist');
        },
        () => {
          this.offerings = snapshot; // revert
          this.busy.delete(key);
          this.notify('Something went wrong. Please try again.');
        },
      );
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = FALLBACK_IMG;
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
