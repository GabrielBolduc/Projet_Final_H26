import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Ticket, UpdateTicketPayload } from '../models/ticket';

interface ApiResponse<T> {
  status: string;
  code?: number;
  message?: string;
  data: T;
  errors?: any;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/tickets';

  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<ApiResponse<Ticket[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data ?? [];
        }

        throw response;
      }),
      catchError(this.handleError)
    );
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }

        throw response;
      }),
      catchError(this.handleError)
    );
  }

  updateTicket(id: number, payload: UpdateTicketPayload): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${this.API_URL}/${id}`, { ticket: payload }).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }

        throw response;
      }),
      catchError(this.handleError)
    );
  }

  refundTicket(id: number): Observable<Ticket> {
    return this.http.delete<ApiResponse<Ticket>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }

        throw response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    if (error?.error) {
      return throwError(() => error.error);
    }

    return throwError(() => error);
  }
}
