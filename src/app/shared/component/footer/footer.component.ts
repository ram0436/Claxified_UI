import { Component } from "@angular/core";
import { FOOTER_DATA } from "./footer.config";
import { Router } from "@angular/router";

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

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = "";
  subscribeState: "idle" | "success" | "error" = "idle";
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

  constructor(private router: Router) {}

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
    // TODO: wire up to the real newsletter subscription endpoint.
    this.subscribeState = "success";
    this.newsletterEmail = "";
  }

  changeLocation(): void {
    this.router.navigate(["/select-location"]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  // footerSections = FOOTER_DATA;

  // isRouteSection(
  //   section: any
  // ): section is { type: "route"; links: { label: string; slug: string }[] } {
  //   return section.type === "route";
  // }
}
