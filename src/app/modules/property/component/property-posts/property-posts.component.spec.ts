import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyPostsComponent } from './property-posts.component';

describe('PropertyPostsComponent', () => {
  let component: PropertyPostsComponent;
  let fixture: ComponentFixture<PropertyPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyPostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
