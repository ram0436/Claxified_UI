import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { BusinessService } from '../../service/business.service';
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
  selector: 'app-business-product-detail',
  templateUrl: './business-product-detail.component.html',
  styleUrls: ['./business-product-detail.component.css'],
})
export class BusinessProductDetailComponent implements OnInit {
  loading = true;
  product: BusinessProductDto | null = null;
  isOwner = false;
  /** Passed through router state from the business profile page. */
  contactMobile = '';
  contactWhatsApp = '';
  activeImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    public wishlist: OfferingWishlistService,
    private tracker: BusinessAnalyticsTracker,
  ) {}

  ngOnInit(): void {
    const navState = window.history.state as
      | { isOwner?: boolean; contactMobile?: string; contactWhatsApp?: string }
      | undefined;
    this.isOwner = navState?.isOwner === true;
    this.contactMobile = navState?.contactMobile || '';
    this.contactWhatsApp = navState?.contactWhatsApp || '';

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('productId'));
      if (id) this.loadProduct(id);
    });
    this.wishlist.load();
  }

  toggleWishlist(): void {
    if (this.product) this.wishlist.toggle(this.product.id, 'Product');
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.businessService.getBusinessProductDetails(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get sortedImages() {
    return [...(this.product?.images || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }

  get activeImage(): BusinessProductImageDto | undefined {
    return this.sortedImages[this.activeImageIndex];
  }

  setActiveImage(i: number) {
    this.activeImageIndex = i;
  }

  get discountedPrice(): number {
    if (!this.product) return 0;
    if (!this.product.discountPercentage) return this.product.price;
    return Math.round(
      this.product.price -
        (this.product.price * this.product.discountPercentage) / 100,
    );
  }

  goBack(): void {
    window.history.back();
  }

  editProduct(): void {
    if (!this.product) return;
    this.router.navigate(['/business/product', this.product.id, 'edit']);
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
  onShare(): void {}
}
