import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialServiceFilterComponent } from './commercial-service-filter.component';

describe('CommercialServiceFilterComponent', () => {
  let component: CommercialServiceFilterComponent;
  let fixture: ComponentFixture<CommercialServiceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialServiceFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercialServiceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
