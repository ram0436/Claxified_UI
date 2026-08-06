import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BusinessService } from "../../service/business.service";
import { BusinessDirectoryItem } from "./../../model/Business";

@Component({
  selector: "app-business-directories",
  templateUrl: "./business-directories.component.html",
  styleUrls: ["./business-directories.component.css"],
})
export class BusinessDirectoriesComponent implements OnInit {
  businesses: BusinessDirectoryItem[] = [];
  loading: boolean = true;
  loadError: boolean = false;

  constructor(
    private businessService: BusinessService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
  }

  fetchBusinesses(): void {
    this.loading = true;
    this.loadError = false;
    this.businessService.getBusinessList().subscribe(
      (data: BusinessDirectoryItem[]) => {
        this.businesses = (data || []).filter((b) => b.status !== 0);
        this.loading = false;
      },
      () => {
        this.loadError = true;
        this.loading = false;
      }
    );
  }

  viewBusiness(business: BusinessDirectoryItem): void {
    if (!business.tabRefGUID) return;
    this.router.navigate(["/business/profile", business.tabRefGUID]);
  }

  trackByBusinessId(_index: number, business: BusinessDirectoryItem): number {
    return business.id;
  }

  getLocationLabel(business: BusinessDirectoryItem): string {
    const addr = business.businessAddressDto;
    if (!addr) return "";
    return [addr.area, addr.city].filter((part) => !!part).join(", ");
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return "?";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }

  /**
   * true  -> open right now
   * false -> closed right now (either marked closed today, or outside hours)
   * null  -> no usable working-hours data for today, so we don't claim either way
   */
  isOpenNow(business: BusinessDirectoryItem): boolean | null {
    const hours = business.businessWorkingHoursDtoList;
    if (!hours || hours.length === 0) return null;

    const now = new Date();
    const today = hours.find((h) => h.dayOfWeek === now.getDay());
    if (!today) return null;
    if (today.isClosed) return false;

    const openMinutes = this.toMinutes(today.openTime);
    const closeMinutes = this.toMinutes(today.closeTime);
    if (openMinutes === null || closeMinutes === null) return null;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  }

  private toMinutes(time: string): number | null {
    if (!time) return null;
    const [h, m] = time.split(":").map((v) => parseInt(v, 10));
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  callBusiness(event: Event, mobile: string | undefined): void {
    event.stopPropagation();
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    }
  }

  whatsappBusiness(event: Event, whatsApp: string | undefined): void {
    event.stopPropagation();
    if (!whatsApp) return;
    const cleaned = whatsApp.replace(/[^0-9]/g, "");
    if (cleaned) {
      window.open(`https://wa.me/${cleaned}`, "_blank");
    }
  }
}
