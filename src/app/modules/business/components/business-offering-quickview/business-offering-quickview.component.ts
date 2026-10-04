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

@Component({
  selector: 'app-business-offering-quickview',
  templateUrl: './business-offering-quickview.component.html',
  styleUrls: ['./business-offering-quickview.component.css'],
})
export class BusinessOfferingQuickviewComponent implements OnInit {
  @Input() offering!: BusinessOfferingDto;
  @Input() contactMobile = '';
  @Output() close = new EventEmitter<void>();
  @Output() viewFullDetails = new EventEmitter<void>();

  loading = false;
  view: OfferingDetailView = EMPTY_DETAIL_VIEW;

  constructor(private businessService: BusinessService) {}

  ngOnInit(): void {
    this.loadDetail();
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
    if (this.contactMobile) {
      window.location.href = `tel:${this.contactMobile}`;
    }
  }

  onViewFullDetails(): void {
    this.viewFullDetails.emit();
  }
}
