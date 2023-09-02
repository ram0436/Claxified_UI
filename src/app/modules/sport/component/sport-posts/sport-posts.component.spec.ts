import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportPostsComponent } from './sport-posts.component';

describe('SportPostsComponent', () => {
  let component: SportPostsComponent;
  let fixture: ComponentFixture<SportPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SportPostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
