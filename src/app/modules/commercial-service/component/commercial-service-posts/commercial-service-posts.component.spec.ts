import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialServicePostsComponent } from './commercial-service-posts.component';

describe('CommercialServicePostsComponent', () => {
  let component: CommercialServicePostsComponent;
  let fixture: ComponentFixture<CommercialServicePostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommercialServicePostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercialServicePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
