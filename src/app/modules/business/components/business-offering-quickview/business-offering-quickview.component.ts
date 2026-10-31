import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { BusinessAnalyticsTracker } from '../../service/business-analytics-tracker.service';
import {
  BusinessAnalyticsEventType,
  BusinessOfferingAnalyticsEventType,
} from '../../model/business-analytics';

@Component({
  selector: 'app-business-offering-quickview',
  templateUrl: './business-offering-quickview.component.html',
  styleUrls: ['./business-offering-quickview.component.css'],
})
export class BusinessOfferingQuickviewComponent implements OnInit {
  @Input() offering!: BusinessOfferingDto;
  @Input() contactMobile = '';
  /** Owners viewing their own offering are not counted in analytics. */
  @Input() isOwner = false;
  @Output() close = new EventEmitter<void>();
  @Output() viewFullDetails = new EventEmitter<void>();

  loading = false;
  view: OfferingDetailView = EMPTY_DETAIL_VIEW;

  constructor(
    private businessService: BusinessService,
    public wishlist: OfferingWishlistService,
    private tracker: BusinessAnalyticsTracker,
  ) {}

  ngOnInit(): void {
    this.wishlist.load();
    this.loadDetail();

    if (!this.isOwner) {
      this.tracker.trackOffering(
        this.offering.businessId,
        this.offering.id,
        BusinessOfferingAnalyticsEventType.View,
        { once: true },
      );
    }
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.offering.id, this.typeLabel);
  }

  get typeLabel(): string {
    return (
      OFFERING_TYPE_OPTIONS.find(
        (o) => Number(o.value) === Number(this.offering.offeringType),
      )?.label || 'Offering'
    );
  }

  get placeholderIcon(): string {
    return getOfferingIcon(this.offering.offeringType);
  }

  private loadDetail(): void {
    const type = Number(this.offering.offeringType);
    const wrapperKey = DETAIL_WRAPPER_KEY[type];
    if (!wrapperKey) return;

    this.loading = true;
    this.businessService.getOfferingDetail(type, this.offering.id).subscribe(
      (res) => {
        this.view = buildOfferingDetailView(
          type,
          unwrapDetail(res, wrapperKey),
        );
        this.loading = false;
      },
      () => {
        this.view = EMPTY_DETAIL_VIEW;
        this.loading = false;
      },
    );
  }

  onClose(): void {
    this.close.emit();
  }

  onContactBusiness(): void {
    if (!this.isOwner) {
      this.tracker.trackOffering(
        this.offering.businessId,
        this.offering.id,
        BusinessOfferingAnalyticsEventType.Call,
      );
      this.tracker.trackBusiness(
        this.offering.businessId,
        BusinessAnalyticsEventType.Call,
      );
    }
    if (this.contactMobile) {
      window.location.href = `tel:${this.contactMobile}`;
    }
  }

  onViewFullDetails(): void {
    this.viewFullDetails.emit();
  }
}
