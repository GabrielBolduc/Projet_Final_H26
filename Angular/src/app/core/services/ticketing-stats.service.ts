import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { TicketingStats } from '../models/ticketing-stats';

@Injectable({ providedIn: 'root' })
export class TicketingStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/stats/ticketing';

  getStats(filters: { start_date?: string; end_date?: string; categories?: string } = {}): Observable<TicketingStats[]> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    return this.http.get<ApiResponse<TicketingStats[]>>(this.API_URL, { params }).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data ?? [];
        }
        throw response;
      })
    );
  }
}
