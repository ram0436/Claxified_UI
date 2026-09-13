import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorPicksComponent } from './editor-picks.component';

describe('EditorPicksComponent', () => {
  let component: EditorPicksComponent;
  let fixture: ComponentFixture<EditorPicksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorPicksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorPicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
