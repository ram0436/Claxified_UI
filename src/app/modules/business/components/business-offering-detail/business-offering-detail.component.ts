import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, of } from 'rxjs';
import { BusinessService } from '../../service/business.service';
import {
  BusinessOfferingDto,
  OFFERING_TYPE_OPTIONS,
} from '../../model/Business';
import {
  DETAIL_WRAPPER_KEY,
  EMPTY_DETAIL_VIEW,
  OfferingDetailView,
  buildOfferingDetailView,
  getOfferingIcon,
  unwrapDetail,
} from '../../utils/offering-detail-view.util';
import { OfferingWishlistService } from '../../service/offering-wishlist.service';

@Component({
  selector: 'app-business-offering-detail',
  templateUrl: './business-offering-detail.component.html',
  styleUrls: ['./business-offering-detail.component.css'],
})
export class BusinessOfferingDetailComponent implements OnInit {
  loading = true;
  detailLoading = false;
  notFound = false;

  offering: BusinessOfferingDto | null = null;
  view: OfferingDetailView = EMPTY_DETAIL_VIEW;

  /** Passed through router state from the business profile page. */
  isOwner = false;
  contactMobile = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
    public wishlist: OfferingWishlistService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const state: any = history.state || {};

    this.isOwner = !!state.isOwner;
    this.contactMobile = state.contactMobile || '';

    const fromState: BusinessOfferingDto | null =
      state.offering && Number(state.offering.id) === id
        ? state.offering
        : null;

    const parent$: Observable<BusinessOfferingDto | null> = fromState
      ? of(fromState)
      : this.businessService
          .getBusinessOfferingById(id)
          .pipe(map((res: any) => (Array.isArray(res) ? res[0] : res) ?? null));

    parent$.subscribe(
      (offering) => {
        if (!offering) {
          this.loading = false;
          this.notFound = true;
          return;
        }
        this.offering = offering;
        this.loading = false;
        this.loadDetail(offering);
      },
      () => {
        this.loading = false;
        this.notFound = true;
      },
    );
    this.wishlist.load();
  }

  toggleWishlist(): void {
    if (this.offering) this.wishlist.toggle(this.offering.id, this.typeLabel);
  }

  get typeLabel(): string {
    if (!this.offering) return 'Offering';
    return (
      OFFERING_TYPE_OPTIONS.find(
        (o) => Number(o.value) === Number(this.offering!.offeringType),
      )?.label || 'Offering'
    );
  }

  get placeholderIcon(): string {
    return this.offering
      ? getOfferingIcon(this.offering.offeringType)
      : 'category';
  }

  private loadDetail(offering: BusinessOfferingDto): void {
    const type = Number(offering.offeringType);
    const wrapperKey = DETAIL_WRAPPER_KEY[type];
    if (!wrapperKey) return;

    this.detailLoading = true;
    this.businessService.getOfferingDetail(type, offering.id).subscribe(
      (res) => {
        this.view = buildOfferingDetailView(
          type,
          unwrapDetail(res, wrapperKey),
        );
        this.detailLoading = false;
      },
      () => {
        this.view = EMPTY_DETAIL_VIEW;
        this.detailLoading = false;
      },
    );
  }

  goBack(): void {
    this.location.back();
  }

  onContactBusiness(): void {
    if (this.contactMobile) {
      window.location.href = `tel:${this.contactMobile}`;
    }
  }

  onShare(): void {
    const url = window.location.href;
    const title = this.offering?.name || 'Offering';

    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }

    navigator.clipboard
      ?.writeText(url)
      .then(() => this.notify('Link copied to clipboard'))
      .catch(() => this.notify('Could not copy the link'));
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
