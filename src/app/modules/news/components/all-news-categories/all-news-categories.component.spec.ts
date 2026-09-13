import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllNewsCategoriesComponent } from './all-news-categories.component';

describe('AllNewsCategoriesComponent', () => {
  let component: AllNewsCategoriesComponent;
  let fixture: ComponentFixture<AllNewsCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllNewsCategoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllNewsCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
