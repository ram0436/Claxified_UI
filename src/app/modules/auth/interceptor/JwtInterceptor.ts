import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private shouldExcludeToken(url: string): boolean {
    return url.startsWith('https://api.postalpincode.in/pincode/');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the JWT token from local storage or your authentication service
    const token = localStorage.getItem('authToken');

    // Add the token to the Authorization header if it exists
    if (token && !this.shouldExcludeToken(request.url)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
