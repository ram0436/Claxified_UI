import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BusinessLoginComponent } from "../business-login/business-login.component";

export interface FooterLink {
  label: string;
  slug: string;
  indent?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const BUSINESS_FOOTER_SECTIONS: FooterSection[] = [
  // ===== ROW 1 =====
  {
    title: "Promote Your Business",
    links: [
      { label: "Featured Listings", slug: "featured-listings" },
      { label: "Banner Ads", slug: "banner-ads", indent: true },
      { label: "AI Marketing Tools", slug: "ai-marketing-tools", indent: true },
      { label: "Lead Management", slug: "lead-management", indent: true },
      { label: "Analytics", slug: "promote-analytics", indent: true },
      { label: "Featured Business", slug: "featured-business" },
      { label: "Premium Membership", slug: "premium-membership" },
      { label: "Boost Listing", slug: "boost-listing" },
      { label: "SEO Services", slug: "seo-services" },
      { label: "SMS & WhatsApp Campaigns", slug: "sms-whatsapp-campaigns" },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Register Business", slug: "register-business" },
      { label: "Your Businesses", slug: "your-businesses" },
      { label: "Business Dashboard", slug: "business-dashboard" },
      { label: "Business Profile", slug: "business-profile" },
      { label: "Business Reviews", slug: "business-reviews" },
      { label: "Business Leads", slug: "business-leads" },
      { label: "Business Settings", slug: "business-settings" },
      { label: "Team Members", slug: "team-members" },
      { label: "Subscription", slug: "subscription" },
      { label: "Billing & Invoices", slug: "billing-invoices" },
      { label: "Pricing Plans", slug: "pricing-plans" },
      { label: "Notifications", slug: "notifications" },
    ],
  },
  {
    title: "Business Resources",
    links: [
      { label: "Marketing Tips", slug: "marketing-tips" },
      { label: "SEO & AI Guide", slug: "seo-ai-guide" },
      { label: "Business Guides", slug: "business-guides" },
      { label: "Business Templates", slug: "business-templates" },
      { label: "Business Calculator", slug: "business-calculator" },
      { label: "Business Blog", slug: "business-blog" },
      { label: "Success Stories", slug: "success-stories" },
      { label: "FAQ", slug: "faq" },
      { label: "Seller Policy", slug: "seller-policy" },
    ],
  },
  {
    title: "Verification & Trust",
    links: [
      { label: "Verify Your Business", slug: "verify-your-business" },
      { label: "Verification Status", slug: "verification-status" },
      { label: "Verified Badge", slug: "verified-badge" },
      { label: "Identity Verification", slug: "identity-verification" },
      { label: "GST Verification", slug: "gst-verification" },
      { label: "Company Verification", slug: "company-verification" },
      { label: "Benefits of Verification", slug: "verification-benefits" },
    ],
  },
  {
    title: "AI & Business Tools",
    links: [
      { label: "AI Listing Generator", slug: "ai-listing-generator" },
      { label: "AI Description Generator", slug: "ai-description-generator" },
      { label: "AI Title Generator", slug: "ai-title-generator" },
      { label: "AI Keyword Generator", slug: "ai-keyword-generator" },
      { label: "AI Image Enhancer", slug: "ai-image-enhancer" },
      { label: "AI Review Reply Generator", slug: "ai-review-reply-generator" },
      { label: "AI Chat Assistant", slug: "ai-chat-assistant" },
      { label: "Business Analytics", slug: "business-analytics" },
      { label: "Bulk Upload", slug: "bulk-upload" },
      { label: "Developer API", slug: "developer-api" },
    ],
  },

  // ===== ROW 2 =====
  {
    title: "For Buyers",
    links: [
      { label: "Find Businesses", slug: "find-businesses" },
      { label: "Saved Businesses", slug: "saved-businesses" },
      { label: "Recent Searches", slug: "recent-searches" },
      { label: "Reviews", slug: "reviews" },
      { label: "Favorites", slug: "favorites" },
      { label: "Buyer Dashboard", slug: "buyer-dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Support", slug: "contact-support" },
      { label: "Raise a Ticket", slug: "raise-a-ticket" },
      { label: "Help Center", slug: "help-center" },
      { label: "Community Forum", slug: "community-forum" },
      { label: "Live Chat", slug: "live-chat" },
      { label: "Report Bug", slug: "report-bug" },
      { label: "Feature Request", slug: "feature-request" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", slug: "about" },
      { label: "Careers", slug: "careers" },
      { label: "Press", slug: "press" },
      { label: "Media Kit", slug: "media-kit" },
      { label: "Contact Us", slug: "contact-us" },
      { label: "Partners", slug: "partners" },
      { label: "Investors", slug: "investors" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", slug: "privacy-policy" },
      { label: "Terms of Service", slug: "terms-of-service" },
      { label: "Cookie Policy", slug: "cookie-policy" },
      { label: "Refund Policy", slug: "refund-policy" },
      { label: "Cancellation Policy", slug: "cancellation-policy" },
      { label: "Copyright Policy", slug: "copyright-policy" },
    ],
  },
  {
    title: "Trust & Safety",
    links: [
      { label: "Safety Tips", slug: "safety-tips" },
      { label: "Avoid Fraud", slug: "avoid-fraud" },
      { label: "Report Fraud", slug: "report-fraud" },
      { label: "Trust Center", slug: "trust-center" },
      { label: "Verified Sellers", slug: "verified-sellers" },
      { label: "Community Guidelines", slug: "community-guidelines" },
    ],
  },
];

@Component({
  selector: "app-business-footer",
  templateUrl: "./business-footer.component.html",
  styleUrls: ["./business-footer.component.css"],
})
export class BusinessFooterComponent {
  dialogRef!: MatDialogRef<BusinessLoginComponent>;

  footerSections: FooterSection[] = BUSINESS_FOOTER_SECTIONS;

  constructor(private dialog: MatDialog) {}

  registerNewBusiness() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }

    this.dialogRef = this.dialog.open(BusinessLoginComponent, {
      width: "800px",
      maxWidth: "95vw",
      panelClass: "business-login-dialog-container",
      autoFocus: false,
    });

    this.dialogRef.afterClosed().subscribe(() => {});
  }
}
