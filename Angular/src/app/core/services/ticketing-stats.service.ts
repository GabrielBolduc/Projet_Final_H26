import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { TicketingStats } from '../models/ticketing-stats';

@Injectable({ providedIn: 'root' })
export class TicketingStatsService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/ticketing_stats';

  getStats(): Observable<TicketingStats[]> {
    return this.http.get<ApiResponse<TicketingStats[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data ?? [];
        }
        throw response;
      })
    );
  }
}
