import { Injectable, signal, inject, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'auth_state';

  isLoggedIn = signal(
    isPlatformBrowser(this.platformId) 
      ? localStorage.getItem(this.STORAGE_KEY) === 'true' 
      : false
  );

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.STORAGE_KEY, String(this.isLoggedIn()));
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
