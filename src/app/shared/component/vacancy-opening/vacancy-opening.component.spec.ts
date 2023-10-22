import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacancyOpeningComponent } from './vacancy-opening.component';

describe('VacancyOpeningComponent', () => {
  let component: VacancyOpeningComponent;
  let fixture: ComponentFixture<VacancyOpeningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VacancyOpeningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacancyOpeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
