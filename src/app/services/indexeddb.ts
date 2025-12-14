import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

import { Client } from '../models/client'; 
import { Produit } from '../models/produit'; 
import { Facture, LigneCommande } from '../models/facture'; 


export class AppDB extends Dexie {
  clients!: Table<Client, number>;
  produits!: Table<Produit, number>;
  factures!: Table<Facture, number>;
  lignesCommande!: Table<LigneCommande, number>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      clients: '++id, name, lastName',
      produits: '++id, nameProd',
      factures: '++id, numFacture, clientId',
      lignesCommande: '++id, factureId, produitId',
    });
  }
}


@Injectable({
  providedIn: 'root'
})
export class IndexeddbService {
  private db: AppDB;

  constructor() {
    this.db = new AppDB();
  }

  getDB(): AppDB {
    return this.db;
  }
}