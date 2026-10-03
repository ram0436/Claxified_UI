import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessOfferingQuickviewComponent } from './business-offering-quickview.component';

describe('BusinessOfferingQuickviewComponent', () => {
  let component: BusinessOfferingQuickviewComponent;
  let fixture: ComponentFixture<BusinessOfferingQuickviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessOfferingQuickviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessOfferingQuickviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
