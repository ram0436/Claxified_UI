import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliancePostsComponent } from './appliance-posts.component';

describe('AppliancePostsComponent', () => {
  let component: AppliancePostsComponent;
  let fixture: ComponentFixture<AppliancePostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppliancePostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliancePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
