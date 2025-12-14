import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client';

import { Client } from '../../models/client'; 
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';     

@Component({
  selector: 'app-clients',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class ClientsComponent implements OnInit {
  clients$!: Observable<Client[]>; 
  
  
  newClient: { name: string, lastName: string } = { name: '', lastName: '' };
  
  constructor(private clientService: ClientService) { }

  ngOnInit(): void {
    this.clients$ = this.clientService.getClients();
  }

  async addClient(): Promise<void> {
    
    if (this.newClient.name && this.newClient.lastName) {
      await this.clientService.addClient(this.newClient);
      this.newClient = { name: '', lastName: '' };
    } else {
      alert('Veuillez remplir le prénom et le nom du client.');
    }
  }

  async deleteClient(id: number | undefined): Promise<void> {
    if (id !== undefined && confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      await this.clientService.deleteClient(id);
    }
  }
}