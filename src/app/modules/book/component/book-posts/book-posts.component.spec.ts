import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookPostsComponent } from './book-posts.component';

describe('BookPostsComponent', () => {
  let component: BookPostsComponent;
  let fixture: ComponentFixture<BookPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookPostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
