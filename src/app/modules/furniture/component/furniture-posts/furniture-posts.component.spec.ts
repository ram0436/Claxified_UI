import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FurniturePostsComponent } from './furniture-posts.component';

describe('FurniturePostsComponent', () => {
  let component: FurniturePostsComponent;
  let fixture: ComponentFixture<FurniturePostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FurniturePostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FurniturePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
