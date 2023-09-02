import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportFilterComponent } from './sport-filter.component';

describe('SportFilterComponent', () => {
  let component: SportFilterComponent;
  let fixture: ComponentFixture<SportFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SportFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
