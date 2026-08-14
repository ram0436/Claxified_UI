import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusinessProductComponent } from './add-business-product.component';

describe('AddBusinessProductComponent', () => {
  let component: AddBusinessProductComponent;
  let fixture: ComponentFixture<AddBusinessProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBusinessProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusinessProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
