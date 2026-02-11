import { Injectable, signal, inject, effect, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
  export class AuthService {
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);
    private readonly STORAGE_KEY = 'auth_state';

  isLoggedIn = signal(false);

  constructor() {
    afterNextRender(() => {
      const savedState = localStorage.getItem(this.STORAGE_KEY) === 'true';
      if (savedState) {
        this.isLoggedIn.set(true);
      }
    });
  }

  login() {
    this.isLoggedIn.set(true);
    this.router.navigate(['/']);
  }

  logout() {
    this.isLoggedIn.set(false);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/']);
  }
}