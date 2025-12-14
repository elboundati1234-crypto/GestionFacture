
export interface Facture {
  id?: number;
  numFacture: string;
  date: Date;
  clientId: number;
}


export interface LigneCommande {
  id?: number;
  quantite: number;
  produitId: number;
  factureId: number;
}


export interface FactureDetail extends Facture {
  clientName?: string; 
  lignes: LigneCommande[];
  totalHT: number;
}