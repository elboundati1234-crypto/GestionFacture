import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

// --- 1. Définition des Interfaces des Modèles (pour la typographie) ---

export interface Client {
  id?: number; // Clé primaire auto-incrémentée par Dexie
  name: string;
  lastName: string;
}

export interface Produit {
  id?: number;
  nameProd: string;
  description: string;
  prix: number; // Utiliser 'number' pour les prix
}

export interface Facture {
  id?: number;
  numFacture: string;
  date: Date;
  clientId: number; // Clé étrangère vers Client.id
}

export interface LigneCommande {
  id?: number;
  quantite: number;
  produitId: number; // Clé étrangère vers Produit.id
  factureId: number; // Clé étrangère vers Facture.id
}
export interface FactureDetail extends Facture {
  clientName?: string; // Nom du client pour l'affichage
  lignes: LigneCommande[];
  totalHT: number;
}

// --- 2. Définition de la Base de Données (AppDB) ---

export class AppDB extends Dexie {
  // Déclarez les tables. Dexie les typifie automatiquement.
  clients!: Table<Client, number>;
  produits!: Table<Produit, number>;
  factures!: Table<Facture, number>;
  lignesCommande!: Table<LigneCommande, number>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      // Définition des schémas :
      // Clé Primaire (++) + Index(es)
      clients: '++id, name, lastName',
      produits: '++id, nameProd',
      factures: '++id, numFacture, clientId', // Index sur clientId pour les recherches
      lignesCommande: '++id, factureId, produitId', // Index sur les deux clés étrangères
    });

    // Optionnel : Mappage des classes pour les modèles
    this.on('populate', () => this.populate());
  }

  // Fonction pour ajouter des données initiales (optionnel)
  async populate() {
    // Ajoutez ici des données initiales si nécessaire
  }
}

// --- 3. Création et Exportation du Service Angular ---

@Injectable({
  providedIn: 'root'
})
export class IndexeddbService {
  private db: AppDB;

  constructor() {
    this.db = new AppDB();
  }

  // Méthode pour accéder à la base de données
  getDB(): AppDB {
    return this.db;
  }
}