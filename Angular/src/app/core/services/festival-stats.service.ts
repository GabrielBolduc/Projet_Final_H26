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

  getFestivalStats(year?: number | null, festivalIds?: number[]): Observable<any> {
    let params = new HttpParams();

    if (year){
      params = params.set('year', year.toString())
    }

    if (festivalIds && festivalIds.length > 0){
      festivalIds.forEach(id =>{
        params = params.append('festivals_ids[]', id.toString())
      })
    }

    return this.http.get<ApiResponse<any>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') return response.data;
        throw response;
      }),
      catchError((error) => throwError(() => error))
    );
  }
}