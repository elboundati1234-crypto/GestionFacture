import { TestBed } from '@angular/core/testing';

import { Indexeddb } from './indexeddb';

describe('Indexeddb', () => {
  let service: Indexeddb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Indexeddb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
