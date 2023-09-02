import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FurnitureFilterComponent } from './furniture-filter.component';

describe('FurnitureFilterComponent', () => {
  let component: FurnitureFilterComponent;
  let fixture: ComponentFixture<FurnitureFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FurnitureFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FurnitureFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
