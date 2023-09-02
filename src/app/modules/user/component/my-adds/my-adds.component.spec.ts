import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAddsComponent } from './my-adds.component';

describe('MyAddsComponent', () => {
  let component: MyAddsComponent;
  let fixture: ComponentFixture<MyAddsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyAddsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAddsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
