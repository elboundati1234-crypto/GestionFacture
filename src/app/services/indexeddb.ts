import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';



export interface Client {
  id?: number; 
  name: string;
  lastName: string;
}

export interface Produit {
  id?: number;
  nameProd: string;
  description: string;
  prix: number;
}

export interface Facture {
  id?: number;
  numFacture: string;
  date: Date;
  clientId: number;
}

export interface LigneCommande {
  id?: number;
  quantite: number;
  produitId: number;
  factureId: number;
}

export interface FactureDetail extends Facture {
  clientName?: string; 
  lignes: LigneCommande[];
  totalHT: number;
}




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