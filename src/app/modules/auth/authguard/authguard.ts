import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const userRole = localStorage.getItem('role');
    const allowedAdminRoutes = ['admin'];
    const allowedUserRoutes = [""];
    const commonRoutes = [
      "post-menu","Gadgets", "add-post", "view-posts","post-details/:id",
      "Vehicles",'Electronics & Appliances','Furniture','Sports & Hobbies','Fashion','Books',
      "user","account","account/personal","account/myadds","account/security"]
    const requestedRoute = route.routeConfig?.path || "";
    if (userRole == 'Admin') {
      if (allowedAdminRoutes.includes(requestedRoute)) {
        return true;
      } else if (commonRoutes.includes(requestedRoute))
        return true;
      else {
        this.router.navigate(['/']);
        return false;
      }
    } else if (userRole == 'User') {
      if (allowedUserRoutes.includes(requestedRoute)) {
        return true;
      } else if (commonRoutes.includes(requestedRoute))
        return true;
      else {
        this.router.navigate(['/']);
        return false;
      }
    }
    else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
