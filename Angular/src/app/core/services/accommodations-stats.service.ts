import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AccommodationStatsResponse } from '../models/accommodation';

@Injectable({
  providedIn: 'root'
})
export class AccommodationsStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/stats/accommodations';

  getStats(): Observable<AccommodationStatsResponse> {
    return this.http.get<AccommodationStatsResponse>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response;
        }
        throw response;
      }),
      catchError((error) => {
        console.error('Error fetching accommodation statistics:', error);
        return throwError(() => error);
      })
    );
  }
}
