import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interface matching your Rails render_success structure
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  code?: number;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/reservations'; // Matches your Rails namespace

  /**
   * Fetches all reservations for the current user.
   * Rails: index action
   */
  getReservations(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.API_URL).pipe(
      catchError(error => {
        console.error('Error fetching reservations', error);
        return of({ status: 'error', data: [] });
      })
    );
  }

  /**
   * Creates a new reservation.
   * Rails: create action
   */
  create(reservationData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.API_URL, { reservation: reservationData }).pipe(
      catchError(error => {
        console.error('Error creating reservation', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Updates an existing reservation.
   * Rails: update action
   */
  update(id: number, reservationData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}`, { reservation: reservationData }).pipe(
      catchError(error => {
        console.error('Error updating reservation', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Deletes (cancels) a reservation.
   * Rails: destroy action
   */
  delete(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`).pipe(
      map(response => response.status === 'success'),
      catchError(() => of(false))
    );
  }
}
