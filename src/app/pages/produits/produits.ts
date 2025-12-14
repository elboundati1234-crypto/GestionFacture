import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produit';
import { Produit } from '../../models/produit'; 
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';     

@Component({
  selector: 'app-produits',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './produits.html',
  styleUrls: ['./produits.css']
})
export class ProduitsComponent implements OnInit {
  produits$!: Observable<Produit[]>; 
  
  newProduit: { nameProd: string, description: string, prix: number } = { nameProd: '', description: '', prix: 0 };
  
  constructor(private produitService: ProduitService) { }

  ngOnInit(): void {
    this.produits$ = this.produitService.getProduits();
  }

  async addProduit(): Promise<void> {
    const { nameProd, prix } = this.newProduit;
    
    if (nameProd && prix > 0) {
      await this.produitService.addProduit(this.newProduit);
      this.newProduit = { nameProd: '', description: '', prix: 0 };
    } else {
      alert('Veuillez renseigner le nom et un prix valide (> 0) pour le produit.');
    }
  }

  async deleteProduit(id: number | undefined): Promise<void> {
    if (id !== undefined && confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await this.produitService.deleteProduit(id);
    }
  }
}