import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';

// authguard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const userRole = localStorage.getItem('role');
    const allowedAdminRoutes = [
      'admin-dashboard',
      'admin-overview',
      'attribute-mapping',
    ];
    const allowedUserRoutes = [''];
    const commonRoutes = [
      'my-claxified',
      'post-menu',
      'Gadgets',
      'add-post',
      'view-posts',
      'post-details/:id',
      'Vehicles',
      'Electronics & Appliances',
      'Furniture',
      'Sports & Hobbies',
      'Fashion',
      'Books',
      'user',
      'account',
      'account/personal',
      'account/myadds',
      'account/security',
    ];
    const requestedRoute = route.routeConfig?.path || '';
    const isBusinessRoute = state.url.startsWith('/business');

    if (userRole == 'Admin') {
      if (isBusinessRoute || allowedAdminRoutes.includes(requestedRoute)) {
        return true;
      } else if (commonRoutes.includes(requestedRoute)) return true;
      else {
        this.router.navigate(['/']);
        return false;
      }
    } else if (userRole == 'User') {
      if (isBusinessRoute || allowedUserRoutes.includes(requestedRoute)) {
        return true;
      } else if (commonRoutes.includes(requestedRoute)) return true;
      else {
        this.router.navigate(['/']);
        return false;
      }
    } else if (userRole == 'AppSupport') {
      if (isBusinessRoute || allowedUserRoutes.includes(requestedRoute)) {
        return true;
      } else if (commonRoutes.includes(requestedRoute)) return true;
      else {
        this.router.navigate(['/']);
        return false;
      }
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
