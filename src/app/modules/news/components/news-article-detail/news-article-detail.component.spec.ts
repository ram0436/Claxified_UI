import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsArticleDetailComponent } from './news-article-detail.component';

describe('NewsArticleDetailComponent', () => {
  let component: NewsArticleDetailComponent;
  let fixture: ComponentFixture<NewsArticleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsArticleDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsArticleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
