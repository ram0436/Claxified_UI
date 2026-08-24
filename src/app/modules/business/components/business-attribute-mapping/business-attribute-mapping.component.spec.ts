import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessAttributeMappingComponent } from './business-attribute-mapping.component';

describe('BusinessAttributeMappingComponent', () => {
  let component: BusinessAttributeMappingComponent;
  let fixture: ComponentFixture<BusinessAttributeMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessAttributeMappingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessAttributeMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
