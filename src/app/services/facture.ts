import { Injectable } from '@angular/core';
import {
  Facture,
  FactureDetail,
  LigneCommande,
  IndexeddbService,
  Client,
  Produit,
  AppDB // Nécessaire pour les transactions
} from './indexeddb'; 
import { from, Observable } from 'rxjs';
import { liveQuery, Table } from 'dexie';

// Interface utilisée pour la création d'une facture.
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
  // Déclaration sans initialisation immédiate
  private db: AppDB;
  private facturesTable: Table<Facture, number>;
  private lignesCommandeTable: Table<LigneCommande, number>;
  private clientsTable: Table<Client, number>;
  private produitsTable: Table<Produit, number>;

  constructor(private indexeddbService: IndexeddbService) {
    // 💡 CORRECTION : Initialisation DANS le constructeur après injection
    this.db = this.indexeddbService.getDB();
    this.facturesTable = this.db.factures;
    this.lignesCommandeTable = this.db.lignesCommande;
    this.clientsTable = this.db.clients;
    this.produitsTable = this.db.produits;
  }

  // --- LOGIQUE DE CRÉATION ATOMIQUE ---

  /**
   * Crée une nouvelle facture et toutes ses lignes de commande en une seule transaction.
   * @param payload Les données de la facture et ses lignes.
   * @returns L'ID (number) de la facture créée.
   */
  async createFacture(payload: FactureCreationPayload): Promise<number> {
    const { lignes, ...factureData } = payload;
    let factureId = 0;

    // Début de la transaction atomique (rw = read/write)
    await this.db.transaction('rw', this.facturesTable, this.lignesCommandeTable, async (tx) => {
      // 1. Ajouter la Facture principale
      factureId = await this.facturesTable.add(factureData as Facture);

      // 2. Préparer et ajouter les Lignes de Commande
      const lignesAvecFactureId: Omit<LigneCommande, 'id'>[] = lignes.map(ligne => ({
        ...ligne,
        factureId: factureId // Associer l'ID de la facture nouvellement créée
      }));

      await this.lignesCommandeTable.bulkAdd(lignesAvecFactureId);
    });

    console.log(`Facture et lignes de commande créées avec succès (ID: ${factureId})`);
    return factureId;
  }

  // --- LOGIQUE DE RÉCUPÉRATION AGRÉGÉE ---

  /**
   * Fonction utilitaire pour assembler toutes les informations de la facture (FactureDetail).
   * Cette fonction est appelée par liveQuery.
   */
  private async getFacturesDetails(): Promise<FactureDetail[]> {
    // Récupération de toutes les données nécessaires en parallèle pour optimiser la performance
    const [allFactures, allLignes, allClients, allProduits] = await Promise.all([
      this.facturesTable.toArray(),
      this.lignesCommandeTable.toArray(),
      this.clientsTable.toArray(),
      this.produitsTable.toArray()
    ]);

    // Création de Maps pour des lookups rapides (performance)
    const clientMap = new Map<number, Client>(allClients.map(c => [c.id!, c]));
    const produitMap = new Map<number, Produit>(allProduits.map(p => [p.id!, p]));
    const lignesMap = allLignes.reduce((acc, ligne) => {
      if (!acc.has(ligne.factureId)) {
        acc.set(ligne.factureId, []);
      }
      acc.get(ligne.factureId)!.push(ligne);
      return acc;
    }, new Map<number, LigneCommande[]>());

    // 3. Assembler FactureDetail
    const details: FactureDetail[] = allFactures.map(facture => {
      const factureId = facture.id!;
      const lignes = lignesMap.get(factureId) || [];
      const client = clientMap.get(facture.clientId);

      // Calcul du total HT
      const totalHT = lignes.reduce((sum, ligne) => {
        const produit = produitMap.get(ligne.produitId);
        if (produit) {
          return sum + (produit.prix * ligne.quantite);
        }
        return sum;
      }, 0);

      return {
        ...facture,
        lignes: lignes,
        clientName: client ? `${client.name} ${client.lastName}` : 'Client Inconnu',
        totalHT: totalHT,
      } as FactureDetail;
    });

    return details.sort((a, b) => (b.id || 0) - (a.id || 0)); // Tri du plus récent au plus ancien
  }

  /**
   * Récupère toutes les FactureDetail sous forme d'Observable (flux réactif).
   */
  getFacturesDetailsObservable(): Observable<FactureDetail[]> {
    return from(liveQuery(() => this.getFacturesDetails()));
  }

  // --- LOGIQUE DE SUPPRESSION ATOMIQUE ---

  /**
   * Supprime une facture et toutes ses lignes associées en une seule transaction.
   * @param factureId L'ID de la facture à supprimer.
   */
  async deleteFacture(factureId: number): Promise<void> {
    await this.db.transaction('rw', this.facturesTable, this.lignesCommandeTable, async (tx) => {
      // 1. Supprimer les Lignes de Commande
      await this.lignesCommandeTable.where('factureId').equals(factureId).delete();
      
      // 2. Supprimer la Facture principale
      await this.facturesTable.delete(factureId);
    });
    console.log(`Facture et lignes de commande (ID: ${factureId}) supprimées.`);
  }
}