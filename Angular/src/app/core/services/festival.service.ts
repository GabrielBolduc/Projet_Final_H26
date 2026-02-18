import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Festival } from '../models/festival';


interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  message?: string;
  code?: number;   
}

@Injectable({ providedIn: 'root' })
export class FestivalService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/festivals'; 

  getFestivals(): Observable<Festival[]> {
    return this.http.get<ApiResponse<Festival[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'erreur api');
        }
      })
    );
  }
}