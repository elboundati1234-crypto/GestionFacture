

import { TestBed } from '@angular/core/testing';


import { FactureService } from '../services/facture';

describe('FactureService', () => {
  let service: FactureService;

  beforeEach(() => {
    TestBed.configureTestingModule({

      providers: [FactureService]
    });

    service = TestBed.inject(FactureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});