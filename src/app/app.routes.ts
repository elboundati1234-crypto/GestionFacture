import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil';
import { ClientsComponent } from './pages/clients/clients';
import { ProduitsComponent } from './pages/produits/produits';
import { FacturesComponent } from './pages/factures/factures';

export const routes: Routes = [
    
    { path: '', component: AccueilComponent }, 
    
  
    { path: 'clients', component: ClientsComponent },
    { path: 'produits', component: ProduitsComponent },
    { path: 'factures', component: FacturesComponent },
    
   
    { path: '**', redirectTo: '' }
];