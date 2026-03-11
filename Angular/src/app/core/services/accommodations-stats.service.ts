import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AccommodationStatsResponse } from '../models/accommodation';

@Injectable({
  providedIn: 'root'
})
export class AccommodationsStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/stats/accommodations';

  getStats(filters?: any): Observable<AccommodationStatsResponse> {
    return this.http.get<AccommodationStatsResponse>(this.API_URL, { params: filters }).pipe(
      switchMap(res => {
        if (res.status === 'success') {
          return of(res);
        }
        return throwError(() => res); 
      }),
      catchError(err => throwError(() => err))
    );
  }
}
