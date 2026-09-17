import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/modules/user/service/user.service';

@Component({
  selector: 'app-claxified-layout',
  templateUrl: './claxified-layout.component.html',
  styleUrls: ['./claxified-layout.component.css'],
})
export class ClaxifiedLayoutComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', icon: 'home', route: 'dashboard' },
    { label: 'My Listings', icon: 'listings', route: 'my-listings' },
    { label: 'My Businesses', icon: 'business', route: 'my-businesses' },
    { label: 'Enquiries & Leads', icon: 'chat', route: 'enquiries' },
    { label: 'Analytics', icon: 'chart', route: 'analytics' },
    { label: 'Packages & Billing', icon: 'card', route: 'billing' },
    { label: 'Settings', icon: 'settings', route: 'settings' },
  ];

  adminNavItems = [
    { label: 'Admin Overview', icon: 'admin', route: 'admin-overview' },
    {
      label: 'Attribute Mapping',
      icon: 'attributes',
      route: 'attribute-mapping',
    },
  ];

  get isAdmin(): boolean {
    return this.userRole?.toLowerCase() === 'admin';
  }

  userId: number = 0;
  userName: string = 'User';
  userRole: string = '';
  isSidebarOpen = false;

  constructor(
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('id')) || 0;
    this.userRole = localStorage.getItem('role') || '';

    const cachedName = localStorage.getItem('firstName');
    if (cachedName) {
      this.userName = cachedName;
    }

    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe({
        next: (data: any) => {
          this.userName =
            [data?.firstName, data?.lastName].filter(Boolean).join(' ') ||
            this.userName;
        },
        error: () => {
          // keep whatever we already have from localStorage
        },
      });
    }
  }

  get userInitials(): string {
    return (
      this.userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('') || 'U'
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 992) {
      this.isSidebarOpen = false;
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
