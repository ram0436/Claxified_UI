import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GadgetFilterComponent } from './gadget-filter.component';

describe('GadgetFilterComponent', () => {
  let component: GadgetFilterComponent;
  let fixture: ComponentFixture<GadgetFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GadgetFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GadgetFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
