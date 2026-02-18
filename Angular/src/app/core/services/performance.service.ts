import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Performance } from '../models/performance';

interface ApiResponse<T> {
  status: string;
  code?: number;
  message?: string;
  data: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private http = inject(HttpClient);
  
  private readonly API_URL = '/api/performances'; 

  getPerformances(): Observable<Performance[]> {
    return this.http.get<ApiResponse<Performance[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Erreur lors du chargement des performances');
        }
      }),
      catchError(this.handleError)
    );
  }

  getPerformance(id: number): Observable<Performance> {
    return this.http.get<ApiResponse<Performance>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Performance introuvable');
        }
      }),
      catchError(this.handleError)
    );
  }

  createPerformance(performance: Partial<Performance>): Observable<Performance> {
    return this.http.post<ApiResponse<Performance>>(this.API_URL, { performance }).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw { message: response.message, errors: response.errors };
        }
      }),
      catchError(this.handleError)
    );
  }

  updatePerformance(id: number, performance: Partial<Performance>): Observable<Performance> {
    return this.http.put<ApiResponse<Performance>>(`${this.API_URL}/${id}`, { performance }).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw { message: response.message, errors: response.errors };
        }
      }),
      catchError(this.handleError)
    );
  }

  deletePerformance(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return;
        } else {
          throw new Error(response.message || 'Erreur lors de la suppression');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Performance:', error);
    if (error.errors) {
      return throwError(() => error);
    }
    return throwError(() => new Error(error.message || 'Erreur serveur inconnue'));
  }
}