import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessProductDetailComponent } from './business-product-detail.component';

describe('BusinessProductDetailComponent', () => {
  let component: BusinessProductDetailComponent;
  let fixture: ComponentFixture<BusinessProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessProductDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
