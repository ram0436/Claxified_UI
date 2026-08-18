import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusinessOfferComponent } from './add-business-offer.component';

describe('AddBusinessOfferComponent', () => {
  let component: AddBusinessOfferComponent;
  let fixture: ComponentFixture<AddBusinessOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBusinessOfferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusinessOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
