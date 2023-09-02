import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplianceFilterComponent } from './appliance-filter.component';

describe('ApplianceFilterComponent', () => {
  let component: ApplianceFilterComponent;
  let fixture: ComponentFixture<ApplianceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplianceFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplianceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
