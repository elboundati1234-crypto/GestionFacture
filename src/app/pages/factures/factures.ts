import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../services/facture';
import { ClientService } from '../../services/client';
import { ProduitService } from '../../services/produit';

import { FactureDetail, Facture, LigneCommande } from '../../models/facture';
import { Client } from '../../models/client';
import { Produit } from '../../models/produit'; 

import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';     

interface NewLigneCommande {
  tempId?: number; 
  produitId: number; 
  quantite: number; 
  prixUnitaire: number;
}

@Component({
  selector: 'app-factures',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './factures.html',
  styleUrls: ['./factures.css']
})
export class FacturesComponent implements OnInit { 
  factures$!: Observable<FactureDetail[]>;
  clients$!: Observable<Client[]>;
  produits$!: Observable<Produit[]>;
    
 
  produitsList: Produit[] = []; 
  productNameMap: Map<number, string> = new Map(); 

  newFacture: {
    clientId: number | null;
    numFacture: string;
    date: string; 
    lignes: NewLigneCommande[];
  } = {
    clientId: null,
    numFacture: this.generateNewFactureNumber(),
    date: new Date().toISOString().substring(0, 10),
    lignes: [],
  };

  tempLigne: NewLigneCommande = {
    produitId: 0,
    quantite: 1,
    prixUnitaire: 0
  };

  constructor(
    private factureService: FactureService,
    private clientService: ClientService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.factures$ = this.factureService.getFacturesDetailsObservable();
    this.clients$ = this.clientService.getClients();
    this.produits$ = this.produitService.getProduits();
    
    this.produits$.subscribe(data => {
      this.produitsList = data;
      
      this.productNameMap.clear();
      data.forEach(p => {
          if (p.id) {
              this.productNameMap.set(p.id, p.nameProd);
          }
      });
    });
  }

  
  generateNewFactureNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().substring(0, 8).replace(/:/g, '');
    return `FANNOE-${dateStr}-${timeStr}`;
  }

  calculateLigneTotal(ligne: NewLigneCommande): number {
    return ligne.quantite * ligne.prixUnitaire;
  }

  calculateFactureTotal(): number {
    return this.newFacture.lignes.reduce((sum, ligne) => sum + this.calculateLigneTotal(ligne), 0);
  }
  
  trackByLigne(index: number, ligne: NewLigneCommande): number | undefined {
    return ligne.tempId; 
  }
  
  
  getProductName(productId: number): string {
      return this.productNameMap.get(productId) || 'Produit Inconnu';
  }
  
 
  onProductSelected(productId: number | null): void {
    
    if (!productId || productId === 0) {
        this.tempLigne.prixUnitaire = 0;
        return;
    }

    const selectedProduct = this.produitsList.find(p => p.id === productId);

    if (selectedProduct) {
        this.tempLigne.produitId = selectedProduct.id || 0;
        this.tempLigne.prixUnitaire = selectedProduct.prix;
        
        if (this.tempLigne.quantite === 0) {
             this.tempLigne.quantite = 1;
        }
    } else {
        this.tempLigne.prixUnitaire = 0;
    }
  }

  
  addLigneCommande(): void {
    if (this.tempLigne.produitId && this.tempLigne.quantite > 0 && this.tempLigne.prixUnitaire > 0) {
      const newLine: NewLigneCommande = {
        ...this.tempLigne,
        tempId: Date.now()
      };
      
      this.newFacture.lignes.push(newLine);
      this.tempLigne = { produitId: 0, quantite: 1, prixUnitaire: 0 };
    } else {
      alert("Veuillez sélectionner un produit et une quantité/prix valides.");
    }
  }

 
  removeLigne(index: number): void {
    this.newFacture.lignes.splice(index, 1);
  }


  async createFacture(): Promise<void> {
    const { clientId, numFacture, date, lignes } = this.newFacture;

    if (!clientId || lignes.length === 0 || !numFacture) {
      alert('Veuillez sélectionner un client, ajouter au moins une ligne de commande et vérifier le numéro de facture.');
      return;
    }

    try {
      const payloadLignes: Omit<LigneCommande, 'id' | 'factureId'>[] = lignes.map(l => ({
        produitId: l.produitId,
        quantite: l.quantite
      }));

      await this.factureService.createFacture({
        clientId: clientId,
        numFacture: numFacture,
        date: new Date(date),
        lignes: payloadLignes
      });

      console.log('Facture créée avec succès.');

      this.newFacture = {
        clientId: null,
        numFacture: this.generateNewFactureNumber(),
        date: new Date().toISOString().substring(0, 10),
        lignes: [],
      };
    } catch (error) {
      console.error('Erreur lors de la création de la facture :', error);
      alert('Une erreur est survenue lors de la création de la facture.');
    }
  }


  async deleteFacture(id: number | undefined): Promise<void> {
    if (id !== undefined && confirm('Êtes-vous sûr de vouloir supprimer cette facture (et toutes ses lignes) ?')) {
      try {
        await this.factureService.deleteFacture(id);
        console.log(`Facture ${id} supprimée.`);
      } catch (error) {
        console.error('Impossible de supprimer la facture :', error);
      }
    }
  }
} 