import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllHeadlinesComponent } from './all-headlines.component';

describe('AllHeadlinesComponent', () => {
  let component: AllHeadlinesComponent;
  let fixture: ComponentFixture<AllHeadlinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllHeadlinesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllHeadlinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
