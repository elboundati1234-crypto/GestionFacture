import { TestBed } from '@angular/core/testing';
import { Produit } from '../models/produit';



describe('Produit', () => {
  let service: Produit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Produit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
