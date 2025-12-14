

import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 


@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    CommonModule
  ], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App { 
  title = 'Gestion des Factures (Angular/IndexedDB)';
}