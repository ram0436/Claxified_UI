import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BusinessService } from '../../service/business.service';
import {
  BusinessOfferingDto,
  OFFERING_TYPE_OPTIONS,
} from '../../model/Business';
import { OfferingType } from '../../enum/business-offering.enum';
import {
  DETAIL_WRAPPER_KEY,
  EMPTY_DETAIL_VIEW,
  OfferingDetailView,
  buildOfferingDetailView,
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
    return Number(this.offering.offeringType) ===
      Number(OfferingType.MedicalService)
      ? 'medical_services'
      : 'category';
  }

  private loadDetail(): void {
    const type = Number(this.offering.offeringType);

    if (type === Number(OfferingType.MedicalService)) {
      this.loading = true;
      this.businessService
        .getOfferingMedicalService(this.offering.id)
        .subscribe(
          (res) => {
            const detail = unwrapDetail(res, DETAIL_WRAPPER_KEY[type]!);
            this.view = buildOfferingDetailView(type, detail);
            this.loading = false;
          },
          () => {
            this.view = EMPTY_DETAIL_VIEW;
            this.loading = false;
          },
        );
    }
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
