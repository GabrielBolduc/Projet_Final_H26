import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Festival } from '../models/festival';
import { ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class FestivalService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/festivals';

  getFestivals(status?: string): Observable<Festival[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<Festival[]>>(this.API_URL, {params}).pipe(
      map(response => {
        if (response.status === 'success') return response.data || [];
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getCurrentFestival(): Observable<Festival | null>{
    return this.http.get<ApiResponse<Festival |null>>(`${this.API_URL}/current`).pipe(
      map(response => {
        if (response.status === 'success') return response.data || null;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getFestival(id: number): Observable<Festival>{
    return this.http.get<ApiResponse<Festival>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') return response.data!;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  createFestival(payload: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.API_URL, {festival: payload}).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  updateFestival(id: number, payload: any): Observable<any>{
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}`, {festival: payload}).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  deleteFestival(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }
}