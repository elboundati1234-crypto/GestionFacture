import { Injectable } from '@angular/core';
import { Client, IndexeddbService } from './indexeddb'; 
import { from, Observable } from 'rxjs';
import { liveQuery, Table } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientsTable: Table<Client, number>;

  constructor(private indexeddbService: IndexeddbService) {
    this.clientsTable = this.indexeddbService.getDB().clients;
  }

  async addClient(client: Omit<Client, 'id'>): Promise<number> {
    return this.clientsTable.add(client);
  }

  getClients(): Observable<Client[]> {
    return from(liveQuery(() => this.clientsTable.toArray()));
  }
  
  async getClientById(id: number): Promise<Client | undefined> {
    return this.clientsTable.get(id);
  }

  async updateClient(id: number, changes: Partial<Client>): Promise<number> {
    return this.clientsTable.update(id, changes);
  }

  async deleteClient(id: number): Promise<void> {
    return this.clientsTable.delete(id);
  }
}