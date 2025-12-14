import { Injectable } from '@angular/core';
import { Client } from '../models/client';
import { Produit } from '../models/produit';
import { Facture, FactureDetail, LigneCommande } from '../models/facture';
import { IndexeddbService, AppDB } from './indexeddb'; 
import { from, Observable } from 'rxjs';
import { liveQuery, Table } from 'dexie';

interface FactureCreationPayload {
  numFacture: string;
  date: Date;
  clientId: number;
  lignes: Omit<LigneCommande, 'id' | 'factureId'>[]; 
}


@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private db: AppDB;
  private facturesTable: Table<Facture, number>;
  private lignesCommandeTable: Table<LigneCommande, number>;
  private clientsTable: Table<Client, number>;
  private produitsTable: Table<Produit, number>;

  constructor(private indexeddbService: IndexeddbService) {
    this.db = this.indexeddbService.getDB();
    this.facturesTable = this.db.factures;
    this.lignesCommandeTable = this.db.lignesCommande;
    this.clientsTable = this.db.clients;
    this.produitsTable = this.db.produits;
  }

  async createFacture(payload: FactureCreationPayload): Promise<number> {
    const { lignes, ...factureData } = payload;
    let factureId = 0;

    await this.db.transaction('rw', this.facturesTable, this.lignesCommandeTable, async (tx) => {
      factureId = await this.facturesTable.add(factureData as Facture);

      const lignesAvecFactureId: Omit<LigneCommande, 'id'>[] = lignes.map(ligne => ({
        ...ligne,
        factureId: factureId
      }));

      await this.lignesCommandeTable.bulkAdd(lignesAvecFactureId);
    });
    return factureId;
  }

  private async getFacturesDetails(): Promise<FactureDetail[]> {
    const [allFactures, allLignes, allClients, allProduits] = await Promise.all([
      this.facturesTable.toArray(),
      this.lignesCommandeTable.toArray(),
      this.clientsTable.toArray(),
      this.produitsTable.toArray()
    ]);

    const clientMap = new Map<number, Client>(allClients.map(c => [c.id!, c]));
    const produitMap = new Map<number, Produit>(allProduits.map(p => [p.id!, p]));
    
    const lignesMap = allLignes.reduce((acc, ligne) => {
      if (!acc.has(ligne.factureId)) { acc.set(ligne.factureId, []); }
      acc.get(ligne.factureId)!.push(ligne);
      return acc;
    }, new Map<number, LigneCommande[]>());

    const details: FactureDetail[] = allFactures.map(facture => {
      const factureId = facture.id!;
      const lignes = lignesMap.get(factureId) || [];
      const client = clientMap.get(facture.clientId);

      const totalHT = lignes.reduce((sum, ligne) => {
        const produit = produitMap.get(ligne.produitId);
        return sum + (produit ? produit.prix * ligne.quantite : 0);
      }, 0);

      return {
        ...facture,
        lignes: lignes,
        clientName: client ? `${client.name} ${client.lastName}` : 'Client Inconnu',
        totalHT: totalHT,
      } as FactureDetail;
    });

    return details.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  getFacturesDetailsObservable(): Observable<FactureDetail[]> {
    return from(liveQuery(() => this.getFacturesDetails()));
  }

  async deleteFacture(factureId: number): Promise<void> {
    await this.db.transaction('rw', this.facturesTable, this.lignesCommandeTable, async (tx) => {
      await this.lignesCommandeTable.where('factureId').equals(factureId).delete();
      await this.facturesTable.delete(factureId);
    });
  }
}