import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FashionPostsComponent } from './fashion-posts.component';

describe('FashionPostsComponent', () => {
  let component: FashionPostsComponent;
  let fixture: ComponentFixture<FashionPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FashionPostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FashionPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
