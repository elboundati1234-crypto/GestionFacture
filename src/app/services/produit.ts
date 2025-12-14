import { Injectable } from '@angular/core';
import { IndexeddbService } from './indexeddb'; 
import { Produit } from '../models/produit'; 
import { from, Observable } from 'rxjs';
import { liveQuery, Table } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private produitsTable: Table<Produit, number>;

  constructor(private indexeddbService: IndexeddbService) {
    this.produitsTable = this.indexeddbService.getDB().produits;
  }

  async addProduit(produit: Omit<Produit, 'id'>): Promise<number> {
    return this.produitsTable.add(produit);
  }

  getProduits(): Observable<Produit[]> {
    return from(liveQuery(() => this.produitsTable.toArray()));
  }

  async getProduitById(id: number): Promise<Produit | undefined> {
    return this.produitsTable.get(id);
  }
  
  async updateProduit(id: number, changes: Partial<Produit>): Promise<number> {
    return this.produitsTable.update(id, changes);
  }

  async deleteProduit(id: number): Promise<void> {
    return this.produitsTable.delete(id);
  }
}