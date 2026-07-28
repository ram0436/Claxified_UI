import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessPublicProfileComponent } from './business-public-profile.component';

describe('BusinessPublicProfileComponent', () => {
  let component: BusinessPublicProfileComponent;
  let fixture: ComponentFixture<BusinessPublicProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessPublicProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessPublicProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
