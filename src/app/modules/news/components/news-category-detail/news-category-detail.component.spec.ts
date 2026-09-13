import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsCategoryDetailComponent } from './news-category-detail.component';

describe('NewsCategoryDetailComponent', () => {
  let component: NewsCategoryDetailComponent;
  let fixture: ComponentFixture<NewsCategoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsCategoryDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsCategoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
