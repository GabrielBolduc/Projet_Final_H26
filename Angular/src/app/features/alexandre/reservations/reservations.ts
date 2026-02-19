import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatSidenavModule, 
    MatListModule, 
    MatIconModule
  ],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations {}
