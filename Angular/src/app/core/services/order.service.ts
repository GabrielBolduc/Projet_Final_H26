import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateOrderPayload, Order } from '../models/order';

interface ApiResponse<T> {
  status: string;
  code?: number;
  message?: string;
  data: T;
  errors?: any;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/orders';

  getMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data ?? [];
        }

        throw response;
      }),
      catchError(this.handleError)
    );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }

        throw response;
      }),
      catchError(this.handleError)
    );
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.API_URL, { order: payload }).pipe(
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
