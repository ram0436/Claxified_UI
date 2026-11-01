import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  BusinessProductDto,
  BusinessProductImageDto,
} from '../../model/Business';
import { OfferingWishlistService } from '../../service/offering-wishlist.service';
import { BusinessAnalyticsTracker } from '../../service/business-analytics-tracker.service';
import { BusinessAnalyticsEventType } from '../../model/business-analytics';
import {
  openPhoneCall,
  openWhatsAppChat,
  resolveWhatsAppNumber,
} from '../../utils/business-contact.util';

@Component({
  selector: 'app-business-product-quickview',
  templateUrl: './business-product-quickview.component.html',
  styleUrls: ['./business-product-quickview.component.css'],
})
export class BusinessProductQuickviewComponent {
  @Input() product!: BusinessProductDto;
  @Input() contactMobile = '';
  @Input() contactWhatsApp = '';
  /** Owners viewing their own product are not counted in analytics. */
  @Input() isOwner = false;
  @Output() close = new EventEmitter<void>();
  @Output() viewFullDetails = new EventEmitter<void>();

  activeImageIndex = 0;

  constructor(
    public wishlist: OfferingWishlistService,
    private tracker: BusinessAnalyticsTracker,
  ) {}

  ngOnInit(): void {
    this.wishlist.load();
  }

  toggleWishlist(): void {
    this.wishlist.toggle(this.product.id, 'Product');
  }

  get sortedImages() {
    return [...(this.product.images || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }

  get activeImage(): BusinessProductImageDto | undefined {
    return (
      this.sortedImages[this.activeImageIndex] ||
      this.sortedImages.find((i) => i.isPrimary) ||
      this.sortedImages[0]
    );
  }

  setActiveImage(i: number) {
    this.activeImageIndex = i;
  }

  get discountedPrice(): number {
    if (!this.product.discountPercentage) return this.product.price;
    return Math.round(
      this.product.price -
        (this.product.price * this.product.discountPercentage) / 100,
    );
  }

  onClose(): void {
    this.close.emit();
  }

  onViewFullDetails(): void {
    this.viewFullDetails.emit();
  }

  get whatsAppNumber(): string {
    return resolveWhatsAppNumber(this.contactWhatsApp, this.contactMobile);
  }

  /** Business-level analytics; the owner's own clicks are never counted. */
  private trackContact(type: BusinessAnalyticsEventType): void {
    const businessId = this.product?.businessId;
    if (this.isOwner || !businessId) return;
    this.tracker.trackBusiness(businessId, type);
  }

  onCall(): void {
    this.trackContact(BusinessAnalyticsEventType.Call);
    openPhoneCall(this.contactMobile);
  }

  onWhatsApp(): void {
    this.trackContact(BusinessAnalyticsEventType.WhatsAppClick);
    openWhatsAppChat(this.whatsAppNumber);
  }
}
