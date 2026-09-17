import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesBillingComponent } from './packages-billing.component';

describe('PackagesBillingComponent', () => {
  let component: PackagesBillingComponent;
  let fixture: ComponentFixture<PackagesBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackagesBillingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagesBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
