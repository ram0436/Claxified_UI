import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDirectoriesComponent } from './business-directories.component';

describe('BusinessDirectoriesComponent', () => {
  let component: BusinessDirectoriesComponent;
  let fixture: ComponentFixture<BusinessDirectoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessDirectoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessDirectoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
