import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessServiceDetailComponent } from './business-service-detail.component';

describe('BusinessServiceDetailComponent', () => {
  let component: BusinessServiceDetailComponent;
  let fixture: ComponentFixture<BusinessServiceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessServiceDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessServiceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
