import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { BusinessService } from './business.service';

@Injectable({ providedIn: 'root' })
export class OfferingWishlistService {
  private ids = new Set<number>();
  private busy = new Set<number>();
  private loadedFor = 0;

  readonly changed$ = new Subject<void>();

  constructor(
    private api: BusinessService,
    private snackBar: MatSnackBar,
  ) {}

  private get userId(): number {
    return Number(localStorage.getItem('id')) || 0;
  }

  has(id: number): boolean {
    return this.ids.has(id);
  }

  isBusy(id: number): boolean {
    return this.busy.has(id);
  }

  load(force = false): void {
    const uid = this.userId;
    if (!uid) {
      this.ids = new Set();
      this.loadedFor = 0;
      return;
    }
    if (!force && this.loadedFor === uid) return;

    this.api.getWishlistOfferings(uid).subscribe(
      (list) => {
        this.ids = new Set(
          (list || [])
            .filter((w) => !w.isDeleted)
            .map((w) => w.businessOfferingId),
        );
        this.loadedFor = uid;
        this.changed$.next();
      },
      () => {},
    );
  }

  toggle(id: number, label = 'Item'): void {
    const uid = this.userId;
    if (!uid) {
      this.toast('Please log in to use your wishlist.');
      return;
    }
    if (!id || this.busy.has(id)) return;

    const was = this.ids.has(id);
    was ? this.ids.delete(id) : this.ids.add(id);
    this.busy.add(id);
    this.changed$.next();

    const call$ = was
      ? this.api.removeOfferingFromWishlist(uid, id)
      : this.api.addOfferingToWishlist(uid, id);

    call$.subscribe(
      () => {
        this.busy.delete(id);
        this.toast(
          was ? `${label} removed from wishlist` : `${label} added to wishlist`,
        );
        this.changed$.next();
      },
      () => {
        was ? this.ids.add(id) : this.ids.delete(id);
        this.busy.delete(id);
        this.toast('Something went wrong. Please try again.');
        this.changed$.next();
      },
    );
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
