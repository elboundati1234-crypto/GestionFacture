import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientService } from '../../services/client';
import { Client } from '../../services/indexeddb';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class ClientsComponent implements OnInit {
  // Observable qui contiendra la liste des clients.
  // Grâce à LiveQuery et à RxJS, il se mettra à jour automatiquement.
  clients$!: Observable<Client[]>; 
  
  // Modèle pour le formulaire d'ajout d'un nouveau client
  newClient: Omit<Client, 'id'> = { name: '', lastName: '' };
  
  constructor(private clientService: ClientService) { }

  ngOnInit(): void {
    // Récupérer l'Observable de la liste des clients
    this.clients$ = this.clientService.getClients();
  }

  /**
   * Ajoute un nouveau client en utilisant les données du formulaire.
   */
  async addClient(): Promise<void> {
    if (this.newClient.name && this.newClient.lastName) {
      try {
        await this.clientService.addClient(this.newClient);
        
        // Réinitialiser le formulaire après l'ajout réussi
        this.newClient = { name: '', lastName: '' };
        console.log('Nouveau client ajouté via le composant.');
      } catch (error) {
        console.error('Impossible d\'ajouter le client :', error);
        // Ici, vous pourriez afficher un message d'erreur à l'utilisateur
      }
    } else {
      alert('Veuillez remplir le prénom et le nom du client.');
    }
  }

  /**
   * Supprime un client.
   * @param id L'ID du client à supprimer.
   */
  async deleteClient(id: number | undefined): Promise<void> {
    if (id !== undefined && confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await this.clientService.deleteClient(id);
        console.log(`Client ${id} supprimé.`);
      } catch (error) {
        console.error('Impossible de supprimer le client :', error);
      }
    }
  }
}