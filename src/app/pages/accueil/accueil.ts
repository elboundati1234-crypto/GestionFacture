import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.css'],
})
export class AccueilComponent implements OnInit {
    
   
    ngOnInit(): void {
       
    } 
}