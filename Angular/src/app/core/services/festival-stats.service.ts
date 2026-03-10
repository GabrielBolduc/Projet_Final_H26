import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class FestivalStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/stats/festivals';

  getFestivalStats(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') return response.data || [];
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }
}