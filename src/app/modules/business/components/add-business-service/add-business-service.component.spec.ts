import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBusinessServiceComponent } from './add-business-service.component';

describe('AddBusinessServiceComponent', () => {
  let component: AddBusinessServiceComponent;
  let fixture: ComponentFixture<AddBusinessServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBusinessServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBusinessServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
