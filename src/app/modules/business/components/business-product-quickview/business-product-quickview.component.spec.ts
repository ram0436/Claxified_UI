import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessProductQuickviewComponent } from './business-product-quickview.component';

describe('BusinessProductQuickviewComponent', () => {
  let component: BusinessProductQuickviewComponent;
  let fixture: ComponentFixture<BusinessProductQuickviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessProductQuickviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessProductQuickviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
