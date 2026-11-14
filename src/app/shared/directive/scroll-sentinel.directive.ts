import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

@Directive({ selector: '[appScrollSentinel]' })
export class ScrollSentinelDirective
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() sentinelDisabled = false;
  @Input() sentinelMargin = '300px';
  @Output() reached = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private viewReady = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.arm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.viewReady && changes['sentinelDisabled']) this.arm();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private arm(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.sentinelDisabled || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) this.reached.emit();
      },
      { root: null, rootMargin: this.sentinelMargin, threshold: 0 },
    );
    this.observer.observe(this.el.nativeElement);
  }
}
