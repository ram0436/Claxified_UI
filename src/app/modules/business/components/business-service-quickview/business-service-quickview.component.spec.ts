import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessServiceQuickviewComponent } from './business-service-quickview.component';

describe('BusinessServiceQuickviewComponent', () => {
  let component: BusinessServiceQuickviewComponent;
  let fixture: ComponentFixture<BusinessServiceQuickviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessServiceQuickviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessServiceQuickviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
