import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Performance } from '../models/performance';
import { ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private http = inject(HttpClient);
  
  private readonly API_URL = '/api/performances';

  getPerformances(): Observable<Performance[]> {
    return this.http.get<ApiResponse<Performance[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') return response.data!;
        throw response; 
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getPerformance(id: number): Observable<Performance> {
    return this.http.get<ApiResponse<Performance>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') return response.data!;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  createPerformance(payload: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.API_URL, payload).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  updatePerformance(id: number, payload: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}`, payload).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  deletePerformance(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }
}