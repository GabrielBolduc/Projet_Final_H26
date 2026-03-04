import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Reservation } from '@core/models/reservation';
import { ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private http = inject(HttpClient);
  private readonly BASE_URL = '/api';

  list(filters?: { unit_id?: number; festival_id?: number }): Observable<ApiResponse<Reservation[]>> {
    let params = new HttpParams();
    if (filters?.unit_id) params = params.set('unit_id', filters.unit_id.toString());
    if (filters?.festival_id) params = params.set('festival_id', filters.festival_id.toString());

    return this.http.get<ApiResponse<Reservation[]>>(`${this.BASE_URL}/reservations`, { params });
  }

  get(id: number): Observable<Reservation> {
    return this.http.get<ApiResponse<Reservation>>(`${this.BASE_URL}/reservations/${id}`).pipe(
      map(res => this.handleResponse(res))
    );
  }

  create(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.http.post<ApiResponse<Reservation>>(
      `${this.BASE_URL}/reservations`, 
      { reservation }
    ).pipe(map(res => this.handleResponse(res)));
  }

  update(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<ApiResponse<Reservation>>(
      `${this.BASE_URL}/reservations/${id}`, 
      { reservation }
    ).pipe(map(res => this.handleResponse(res)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.BASE_URL}/reservations/${id}`).pipe(
      map(res => {
        if (res.status === 'error') throw new Error(res.message);
        return;
      })
    );
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.status === 'success') {
      return response.data;
    } else {
      throw new Error(response.message || 'An unknown error occurred');
    }
  }
}
