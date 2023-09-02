import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GadgetPostsComponent } from './gadget-posts.component';

describe('GadgetPostsComponent', () => {
  let component: GadgetPostsComponent;
  let fixture: ComponentFixture<GadgetPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GadgetPostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GadgetPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
