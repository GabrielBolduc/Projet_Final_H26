import { Injectable, signal, inject, afterNextRender } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { LoginCredentials } from '../models/loginCredential';
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
          const user = new User(
            data.id,
            data.email,
            data.name,
            data.phone_number,
            data.role || 'CLIENT'
          );
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
        } catch {
          this.logout();
        }
      }
    });
  }

 
  login(credentials: LoginCredentials): Observable<boolean> {
    const payload = { user: credentials };

    return this.http.post<any>(`${this.API_URL}/sign_in`, payload).pipe(
      tap(response => console.log('Réponse reçue :', response)),
      
      map(response => {
        
        if (response.status === 'error') {
          console.warn('Échec métier :', response.message);
          return false; 
        }

        if (response.status === 'success' && response.data?.user) {
          const userData = response.data.user;
          const user = new User(
            userData.id,
            userData.email,
            userData.name,
            userData.phone_number,
            userData.role || 'CLIENT'
          );

          this.isLoggedIn.set(true);
          this.currentUser.set(user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          
          return true; 
        }
        
        return false;
      }),
      
      catchError(error => {
        console.error('Erreur réseau ou serveur :', error);
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