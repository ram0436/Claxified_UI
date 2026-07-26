import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessEditProfileComponent } from './business-edit-profile.component';

describe('BusinessEditProfileComponent', () => {
  let component: BusinessEditProfileComponent;
  let fixture: ComponentFixture<BusinessEditProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessEditProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessEditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
