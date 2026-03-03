import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { CreateOrderPayload, Order } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/orders';
  private readonly ADMIN_API_URL = '/api/admin/orders';

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

  // Admin Methods
  getAllOrders(filters: { festival_id?: number, q?: string, sort?: string } = {}): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(this.ADMIN_API_URL, { params: filters as any }).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data ?? [];
        }
        throw response;
      }),
      catchError(this.handleError)
    );
  }

  getAdminOrder(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.ADMIN_API_URL}/${id}`).pipe(
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
