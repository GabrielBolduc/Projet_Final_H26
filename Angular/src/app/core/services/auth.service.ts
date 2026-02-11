import { Injectable, signal, inject, afterNextRender } from '@angular/core';
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
  private readonly API_URL = '/users'; 
  private readonly STORAGE_KEY = 'festify_user';

  isLoggedIn = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    afterNextRender(() => {
      const savedUser = localStorage.getItem(this.STORAGE_KEY);
      if (savedUser) {
        try {
          const data = JSON.parse(savedUser);
          const user = new User(data.id, data.email, data.name, data.phone_number, data.role);
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
        } catch { this.logout(); }
      }
    });
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    return this.http.post<any>(`${this.API_URL}/sign_in`, { user: credentials }).pipe(
      map(response => {
        // retourne toujours 200. erreur dans le json
        if (response.status === 'error') return false;

        if (response.status === 'success' && response.data?.user) {
          const u = response.data.user;
          const user = new User(u.id, u.email, u.name, u.phone_number, u.role);
          this.isLoggedIn.set(true);
          this.currentUser.set(user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
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
        
        if (response.status === 'error') {
          return false;
        }
        
        if (response.status === 'success' && response.data) {
          const u = response.data.user || response.data;
          
          const user = new User(u.id, u.email, u.name, u.phone_number, u.role);
          this.isLoggedIn.set(true);
          this.currentUser.set(user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          return true;
        }
        
        return false;
      }),
      catchError((error) => {
        return of(false);
      })
    );
  }

  logout() {
    this.http.delete(`${this.API_URL}/sign_out`).subscribe();
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }
}