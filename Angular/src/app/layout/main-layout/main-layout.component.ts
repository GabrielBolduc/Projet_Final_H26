import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .content { padding: 20px; }
  `]
})
export class MainLayoutComponent {}