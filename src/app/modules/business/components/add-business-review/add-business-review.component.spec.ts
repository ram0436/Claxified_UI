import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusinessReviewComponent } from './add-business-review.component';

describe('AddBusinessReviewComponent', () => {
  let component: AddBusinessReviewComponent;
  let fixture: ComponentFixture<AddBusinessReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBusinessReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusinessReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
