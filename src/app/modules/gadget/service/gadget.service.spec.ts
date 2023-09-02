import { TestBed } from '@angular/core/testing';

import { GadgetService } from './gadget.service';

describe('GadgetService', () => {
  let service: GadgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GadgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
