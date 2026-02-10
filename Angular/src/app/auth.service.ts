import { Injectable, signal, inject, effect, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LoginCredentials } from './models/loginCredential';
import { Observable } from 'rxjs';

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

  private SetCurrentUser(isLoggedIn: boolean) {
    this.isLoggedIn.set(isLoggedIn);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, String(isLoggedIn));
    }
  }

  signup(credentials: LoginCredentials): Observable<boolean> {
    this.SetCurrentUser(true);
    this.router.navigate(['/']);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    this.isLoggedIn.set(true);
    this.router.navigate(['/']);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  logout() {
    this.isLoggedIn.set(false);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/']);
  }
}
