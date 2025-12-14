import { Injectable } from '@angular/core';
import { Produit, IndexeddbService } from './indexeddb'; 
import { from, Observable } from 'rxjs';
import { liveQuery, Table } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private produitsTable: Table<Produit, number>;

  constructor(private indexeddbService: IndexeddbService) {
    // Initialisation de la table des produits
    this.produitsTable = this.indexeddbService.getDB().produits;
  }

  /**
   * Ajoute un nouveau produit à la base de données.
   * @param produit Les données du produit à ajouter (sans l'ID).
   * @returns L'ID (number) du nouveau produit créé.
   */
  async addProduit(produit: Omit<Produit, 'id'>): Promise<number> {
    try {
      const id = await this.produitsTable.add(produit);
      console.log('Produit ajouté avec ID :', id);
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit :', error);
      throw error;
    }
  }

  /**
   * Récupère tous les produits sous forme d'Observable (flux réactif).
   * @returns Un Observable qui émet la liste des produits à chaque modification.
   */
  getProduits(): Observable<Produit[]> {
    return from(liveQuery(() => this.produitsTable.toArray()));
  }

  /**
   * Met à jour les informations d'un produit existant.
   * @param id L'ID du produit à mettre à jour.
   * @param changes Les champs du produit à modifier.
   * @returns Le nombre d'enregistrements mis à jour.
   */
  async updateProduit(id: number, changes: Partial<Produit>): Promise<number> {
    try {
      const updatedCount = await this.produitsTable.update(id, changes);
      console.log('Produit mis à jour. Nombre :', updatedCount);
      return updatedCount;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit :', error);
      throw error;
    }
  }

  /**
   * Supprime un produit par son ID.
   * @param id L'ID du produit à supprimer.
   */
  async deleteProduit(id: number): Promise<void> {
    try {
      await this.produitsTable.delete(id);
      console.log('Produit supprimé :', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      throw error;
    }
  }

  /**
   * Récupère un produit par son ID.
   * @param id L'ID du produit.
   * @returns Le produit trouvé, ou undefined.
   */
  async getProduitById(id: number): Promise<Produit | undefined> {
    return this.produitsTable.get(id);
  }
}