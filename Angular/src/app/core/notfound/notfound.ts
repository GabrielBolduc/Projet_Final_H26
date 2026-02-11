import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notfound',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    RouterModule  
  ],
  templateUrl: './notfound.html',
  styleUrl: './notfound.css',
})
export class Notfound {

}
