import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class FestivalStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/stats/festivals';
  
  getFestivalStats(filters?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (filters) {
      if (filters.year) {
        httpParams = httpParams.set('year', filters.year.toString());
      }

      if (filters.festival_ids && filters.festival_ids.length > 0) {
        filters.festival_ids.forEach((id: number) => {
          httpParams = httpParams.append('festival_ids[]', id.toString());
        });
      }
    }

    return this.http.get<ApiResponse<any>>(this.API_URL, { params: httpParams }).pipe(
      map(response => {
        if (response.status === 'success') return response.data;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }
}