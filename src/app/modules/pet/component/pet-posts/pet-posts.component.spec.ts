import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetPostsComponent } from './pet-posts.component';

describe('PetPostsComponent', () => {
  let component: PetPostsComponent;
  let fixture: ComponentFixture<PetPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PetPostsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
