import { Injectable } from '@angular/core';
import { User } from './models/user';
import { LoginCredentials } from './models/loginCredential';
import { SignupCredentials } from './models/signupCredential';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CURRENT_USER_KEY = 'festify.currentUser';
  private _currentUser: User | null = null;

  get isLoggedIn(): boolean {
    return !!this._currentUser;
  }

  constructor(private http: HttpClient) {
    try {
      const stored = localStorage.getItem(this.CURRENT_USER_KEY);
      if (stored) {
        const p = JSON.parse(stored);
        this._currentUser = new User(
          p.id || 0, 
          p.email, 
          p.name || '', 
          p.phone_number || '', 
          p.role
        );
      }
    } catch (e) { console.warn(e); }
  }

  login(credentials: LoginCredentials): Observable<User | boolean> {
    return this.http.post<any>('users/sign_in', { user: credentials }).pipe(
      map(response => {
        if (response.status === 'error') {
          return false;
        }

        if (response.status === 'success' && response.data) {
          const data = response.data;
          
          const user = new User(
            data.id, 
            data.email, 
            data.name, 
            data.phone_number,
            data.role
          );
          
          this.setCurrentUser(user);
          return user;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login Failed:', error);
        return of(false);
      })
    );
  }

  signup(credentials: SignupCredentials): Observable<User | boolean> {
    return this.http.post<any>('users', { user: credentials }).pipe(
      map(response => {
        if (response.status === 'error') {
          return false;
        }

        if (response.status === 'success' && response.data) {
          const data = response.data;
          
          const user = new User(
            data.id, 
            data.email, 
            data.name, 
            '', 
            data.role
          );
          
          this.setCurrentUser(user);
          return user;
        }
        return false;
      }),
      catchError(error => {
        console.error('Signup Error:', error);
        return of(false);
      })
    );
  }

  logOut(): Observable<boolean> {
    return this.http.delete<any>('users/sign_out').pipe(
      map(() => {
        this.setCurrentUser(null);
        return true;
      }),
      catchError(() => {
        this.setCurrentUser(null);
        return of(true);
      })
    );
  }

  get currentUser(): User | null { return this._currentUser; }
  
  private setCurrentUser(user: User | null) {
    this._currentUser = user;
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }
}