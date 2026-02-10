import {Injectable} from '@angular/core';
import {User} from './models/user';
import {LoginCredentials} from './models/loginCredentials';
import {SignupCredentials} from './models/signupCredentials';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly CURRENT_USER_KEY = 'festify.currentUser';

  private _currentUser : User | null = null;

  get currentUser(): User | null {
    return this._currentUser;
  }

  get isLoggedIn(): boolean {
    return !!this._currentUser;
  }

  /*get isAdmin(): boolean {
    //console.log(this._currentUser?.is_admin);
    return !!this._currentUser?.is_admin;
  }
    */

  constructor(private http: HttpClient) {
    try {
    const storedCurrentUser = JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY) ?? 'null');

    if (storedCurrentUser) {
      this._currentUser = new User(storedCurrentUser.id, storedCurrentUser.email, storedCurrentUser.username, storedCurrentUser.telephone, storedCurrentUser.role);
      //console.log(this._currentUser)
    }
    } catch(e) {
      console.warn('Local storage not available:', e);
    }
  }

  getUserId(): number | null {
    return this._currentUser ? this._currentUser.id : null;
  }

  private setCurrentUser(user: User | null) {
    this._currentUser = user;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  login(credentials: LoginCredentials): Observable<null | false | User> {
    return this.http.post('users/sessions', { user: credentials }).pipe(
      catchError(err => {
        return err.error.errors;
      }),
      map((response: any) => {
        if (response.success) {
          try {
            //console.log(response);
            //console.log(response.is_admin)
            const validUser = new User(response.id, response.email, response.username, response.telephone, response.role);
            //console.log(validUser);
            this.setCurrentUser(validUser);
            //console.log(this._currentUser)
            return validUser;
          } catch {
            return false;
          }
        } else if (response instanceof HttpErrorResponse) {
          return false;
        } else {
          return null;
        }
      })
    );
  }

  signup(credentials: SignupCredentials): Observable<null | false | User> {
    return this.http.post('users/registrations'
      , {user: credentials}
    ).pipe(catchError(err => {
      return err.error.errors;
    }),
      map((response: any) => {
        if (response.success) {
          try {
            const validUser = new User(response.id,response.email, response.username, response.telephone, response.role);
            this.setCurrentUser(validUser)
            return validUser
          } catch {
            return false;
          }
        } else if (response instanceof HttpErrorResponse) {
          return false;
        } else {
          return null;
        }
      })
    )
  }

  logOut() {
    
    return this.http.delete('users/sign_out').pipe(map((response: any) => {
      //console.log("logOut", response);
      if (response.success) {
        
        try {
          this.setCurrentUser(null);
          return true
        } catch {
          return false;
        }
      } else {
        
        return null;
      }
    }))
  }

  getCurrentUser(): User | null {
    return this._currentUser;
  }
}