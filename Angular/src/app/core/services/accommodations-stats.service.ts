import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AccommodationStatsResponse } from '../models/accommodation';

export interface StatsFilters {
  name?: string;
  sort_by?: 'name' | 'revenue' | 'date';
  festival_ids?: number[];
  date_after?: string;
  date_before?: string;
}

@Injectable({ providedIn: 'root' })
export class AccommodationsStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/stats/accommodations';

  getStats(filters: any): Observable<AccommodationStatsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params = params.append(`${key}[]`, v));
        } else if (value != null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<AccommodationStatsResponse>(this.API_URL, { params });
  }
}