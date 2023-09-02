import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclePostsComponent } from './vehicle-posts.component';

describe('VehiclePostsComponent', () => {
  let component: VehiclePostsComponent;
  let fixture: ComponentFixture<VehiclePostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehiclePostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiclePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
