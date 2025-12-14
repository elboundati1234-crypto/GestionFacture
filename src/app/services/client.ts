import { Injectable } from '@angular/core';
import { Client, IndexeddbService } from './indexeddb'; 
import { from, Observable } from 'rxjs'; // 👈 Import de RxJS pour Observable
import { liveQuery, Table } from 'dexie'; // 👈 Import correct de liveQuery

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientsTable: Table<Client, number>; // Déclaration du type de la table

  constructor(private indexeddbService: IndexeddbService) {
    // 🐛 CORRECTION DE L'ERREUR D'INITIALISATION :
    // La table doit être initialisée APRÈS que le service IndexeddbService soit injecté.
    this.clientsTable = this.indexeddbService.getDB().clients;
  }

  /**
   * Ajoute un nouveau client à la base de données.
   * @param client Les données du client à ajouter (sans l'ID).
   * @returns L'ID (number) du nouveau client créé.
   */
  async addClient(client: Omit<Client, 'id'>): Promise<number> {
    try {
      const id = await this.clientsTable.add(client);
      console.log('Client ajouté avec ID :', id);
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client :', error);
      throw error;
    }
  }

  /**
   * Récupère tous les clients sous forme d'Observable (flux réactif).
   * @returns Un Observable qui émet la liste des clients à chaque modification.
   */
  getClients(): Observable<Client[]> {
    // 🐛 CORRECTION DE L'ERREUR LIVEQUERY :
    // Utilisation de liveQuery de Dexie, converti en Observable via 'from' (RxJS)
    return from(liveQuery(() => this.clientsTable.toArray()));
  }

  /**
   * Met à jour les informations d'un client existant.
   * @param id L'ID du client à mettre à jour.
   * @param changes Les champs du client à modifier.
   * @returns Le nombre d'enregistrements mis à jour (devrait être 1).
   */
  async updateClient(id: number, changes: Partial<Client>): Promise<number> {
    try {
      const updatedCount = await this.clientsTable.update(id, changes);
      console.log('Client mis à jour. Nombre :', updatedCount);
      return updatedCount;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client :', error);
      throw error;
    }
  }

  /**
   * Supprime un client par son ID.
   * @param id L'ID du client à supprimer.
   */
  async deleteClient(id: number): Promise<void> {
    try {
      await this.clientsTable.delete(id);
      console.log('Client supprimé :', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du client :', error);
      throw error;
    }
  }

  /**
   * Récupère un client par son ID.
   * @param id L'ID du client.
   * @returns Le client trouvé, ou undefined.
   */
  async getClientById(id: number): Promise<Client | undefined> {
    return this.clientsTable.get(id);
  }
}