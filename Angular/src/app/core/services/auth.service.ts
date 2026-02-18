import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginCredentials } from '../models/loginCredential';
import { SignupCredentials } from '../models/signupCredential';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = '/users'; 
  private readonly STORAGE_KEY = 'festify_user';

  currentUser = signal<User | null>(this.getUserFromStorage());
  
  isLoggedIn = signal<boolean>(!!this.currentUser());

  constructor() {

  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem(this.STORAGE_KEY);
      if (savedUser) {
        try {
          const data = JSON.parse(savedUser);
          return new User(data.id, data.email, data.name, data.phone_number, data.type, data.ability);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    return this.http.post<any>(`${this.API_URL}/sign_in`, { user: credentials }).pipe(
      map(response => {
        if (response.status === 'error') return false;

        if (response.status === 'success' && response.data?.user) {
          const u = response.data.user; 
          const user = new User(u.id, u.email, u.name, u.phone_number, u.type, u.ability);
          
          this.setSession(user);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  signup(credentials: SignupCredentials): Observable<boolean> {
    return this.http.post<any>(`${this.API_URL}`, { user: credentials }).pipe(
      map(response => {
        if (response.status === 'error') return false;
        
        if (response.status === 'success' && response.data) {
          const u = response.data.user || response.data;
          const user = new User(u.id, u.email, u.name, u.phone_number, u.type, u.ability);
          
          this.setSession(user);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout() {
    this.http.delete(`${this.API_URL}/sign_out`).subscribe();
    this.clearSession();
    this.router.navigate(['/login']);
  }


  private setSession(user: User) {
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }

  private clearSession() {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return !!(user && user.type === 'Admin');
  }
}