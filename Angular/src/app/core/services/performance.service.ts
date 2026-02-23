import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Performance } from '../models/performance';
import { environment } from '../../../environments/environment';
interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  errors?: any;
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/performances`;

  getPerformances(): Observable<Performance[]> {
    return this.http.get<ApiResponse<Performance[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') return response.data;
        throw new Error(response.message || 'Erreur lors du chargement');
      })
    );
  }

  getPerformance(id: number): Observable<Performance> {
    return this.http.get<ApiResponse<Performance>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') return response.data;
        throw new Error(response.message || 'Erreur lors du chargement');
      })
    );
  }

  createPerformance(payload: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.API_URL, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur API Performance:', error);
        return throwError(() => error);
      })
    );
  }

  updatePerformance(id: number, payload: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}`, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur API Performance:', error);
        return throwError(() => error);
      })
    );
  }

  deletePerformance(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}