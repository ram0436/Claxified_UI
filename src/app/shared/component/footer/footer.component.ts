import { Component, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subscription, filter } from "rxjs";
import { BUSINESS_FOOTER_SECTIONS } from "./../../../modules/business/components/business-footer/business-footer.component";
import { FooterSection } from "./../../../modules/business/components/business-footer/business-footer.component";
import { FOOTER_DATA } from "./footer.config";

interface FooterLink {
  label: string;
  route: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface PopularCategory {
  icon: string;
  name: string;
  count: number;
  colorClass: string;
  route: string;
}

interface SocialLink {
  name: string;
  url: string;
  colorClass: string;
}

type FooterMode = "full" | "simple" | "business";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent implements OnDestroy {
  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = "";
  subscribeState: "idle" | "success" | "error" = "idle";

  // 'full' = default marketplace footer
  // 'simple' = classified-ads routes -> FOOTER_DATA-driven link columns only
  // 'business' = business/* routes -> business footer sections
  footerMode: FooterMode = "full";

  businessFooterSections: FooterSection[] = BUSINESS_FOOTER_SECTIONS;

  // Used only in 'simple' mode (classified-ads routes)
  footerSections = FOOTER_DATA;

  private routerSub: Subscription;

  linkColumns: FooterColumn[] = [
    {
      title: "Marketplace",
      links: [
        { label: "All Categories", route: "/categories" },
        { label: "Popular Ads", route: "/classified-ads" },
        { label: "Premium Ads", route: "/classified-ads" },
        { label: "Offers & Deals", route: "/offers" },
        { label: "Near Me", route: "/search" },
        { label: "Browse Locations", route: "/locations" },
      ],
    },
    {
      title: "Businesses",
      links: [
        { label: "All Businesses", route: "/business/directories" },
        { label: "Top Rated Businesses", route: "/business/directories" },
        { label: "New Businesses", route: "/business/directories" },
        { label: "Verified Businesses", route: "/business/directories" },
        { label: "List Your Business", route: "/business/list" },
        { label: "Business Categories", route: "/categories" },
      ],
    },
    {
      title: "Ads",
      links: [
        { label: "Post Free Ad", route: "/post-menu" },
        { label: "My Ads", route: "/my-ads" },
        { label: "Saved Ads", route: "/saved-ads" },
        { label: "Ad Categories", route: "/categories" },
        { label: "How It Works", route: "/how-it-works" },
        { label: "Safety Tips", route: "/safety-tips" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", route: "/help" },
        { label: "Contact Us", route: "/contact" },
        { label: "FAQs", route: "/faqs" },
        { label: "Terms & Conditions", route: "/terms" },
        { label: "Privacy Policy", route: "/privacy" },
        { label: "Refund Policy", route: "/refund-policy" },
      ],
    },
  ];

  popularCategories: PopularCategory[] = [
    {
      icon: "devices_other",
      name: "Electronics",
      count: 1200,
      colorClass: "c-purple",
      route: "/Electronics/view-posts",
    },
    {
      icon: "directions_car",
      name: "Automobile",
      count: 950,
      colorClass: "c-pink",
      route: "/Vehicles/view-posts",
    },
    {
      icon: "restaurant",
      name: "Food & Restaurants",
      count: 1500,
      colorClass: "c-orange",
      route: "/Commercial Services/view-posts",
    },
    {
      icon: "home",
      name: "Home & Living",
      count: 1100,
      colorClass: "c-green",
      route: "/Furniture/view-posts",
    },
    {
      icon: "spa",
      name: "Beauty & Wellness",
      count: 850,
      colorClass: "c-rose",
      route: "/Fashion/view-posts",
    },
  ];

  socialLinks: SocialLink[] = [
    { name: "facebook", url: "https://facebook.com", colorClass: "c-facebook" },
    {
      name: "instagram",
      url: "https://instagram.com",
      colorClass: "c-instagram",
    },
    { name: "twitter", url: "https://twitter.com", colorClass: "c-twitter" },
    { name: "linkedin", url: "https://linkedin.com", colorClass: "c-linkedin" },
    { name: "youtube", url: "https://youtube.com", colorClass: "c-youtube" },
  ];

  bottomLinks: FooterLink[] = [
    { label: "About Us", route: "/about" },
    { label: "Careers", route: "/careers" },
    { label: "Blog", route: "/blog" },
    { label: "Press", route: "/press" },
    { label: "Sitemap", route: "/sitemap" },
  ];

  constructor(private router: Router) {
    this.footerMode = this.computeFooterMode(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this.footerMode = this.computeFooterMode(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private computeFooterMode(url: string): FooterMode {
    // "/business" and "/business/..." -> business footer
    if (
      url === "/business" ||
      url.startsWith("/business/") ||
      url.startsWith("/business?")
    ) {
      return "business";
    }
    // classified-ads routes -> simplified, FOOTER_DATA-driven footer
    if (url.includes("classified-ads")) {
      return "simple";
    }
    return "full";
  }

  isRouteSection(
    section: any
  ): section is {
    type: "route";
    title: string;
    links: { label: string; slug: string }[];
  } {
    return section.type === "route";
  }

  onNewsletterInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newsletterEmail = input.value;
    this.subscribeState = "idle";
  }

  subscribe(): void {
    const email = this.newsletterEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      this.subscribeState = "error";
      return;
    }
    this.subscribeState = "success";
    this.newsletterEmail = "";
  }

  changeLocation(): void {
    this.router.navigate(["/select-location"]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
