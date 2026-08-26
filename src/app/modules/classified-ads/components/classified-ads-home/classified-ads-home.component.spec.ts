import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassifiedAdsHomeComponent } from './classified-ads-home.component';

describe('ClassifiedAdsHomeComponent', () => {
  let component: ClassifiedAdsHomeComponent;
  let fixture: ComponentFixture<ClassifiedAdsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassifiedAdsHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassifiedAdsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
