import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FashionFilterComponent } from './fashion-filter.component';

describe('FashionFilterComponent', () => {
  let component: FashionFilterComponent;
  let fixture: ComponentFixture<FashionFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FashionFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FashionFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
