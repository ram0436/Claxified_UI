import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusinessOfferingComponent } from './add-business-offering.component';

describe('AddBusinessOfferingComponent', () => {
  let component: AddBusinessOfferingComponent;
  let fixture: ComponentFixture<AddBusinessOfferingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBusinessOfferingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusinessOfferingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
