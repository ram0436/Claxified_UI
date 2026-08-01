import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessFooterComponent } from './business-footer.component';

describe('BusinessFooterComponent', () => {
  let component: BusinessFooterComponent;
  let fixture: ComponentFixture<BusinessFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessFooterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
