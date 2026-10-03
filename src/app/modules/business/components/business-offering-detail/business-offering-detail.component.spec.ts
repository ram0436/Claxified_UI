import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessOfferingDetailComponent } from './business-offering-detail.component';

describe('BusinessOfferingDetailComponent', () => {
  let component: BusinessOfferingDetailComponent;
  let fixture: ComponentFixture<BusinessOfferingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessOfferingDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessOfferingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
