import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Accommodation } from '../models/accommodation';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class AccommodationsService {
  private http = inject(HttpClient); 
  private readonly API_URL = '/api/accommodations'; 

  getAccommodations(category: string): Observable<Accommodation[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<ApiResponse<Accommodation[]>>(this.API_URL, { params }).pipe(
      map(response => this.handleResponse(response))
    );
  }

  getAccommodation(id: number): Observable<Accommodation> {
    return this.http.get<ApiResponse<Accommodation>>(`${this.API_URL}/${id}`).pipe(
      map(response => this.handleResponse(response))
    );
  }

  createAccommodation(accommodation: Partial<Accommodation>): Observable<Accommodation> {
    return this.http.post<ApiResponse<Accommodation>>(this.API_URL, { accommodation }).pipe(
      map(response => this.handleResponse(response))
    );
  }

  updateAccommodation(id: number, accommodation: Partial<Accommodation>): Observable<Accommodation> {
    return this.http.patch<ApiResponse<Accommodation>>(`${this.API_URL}/${id}`, { accommodation }).pipe(
      map(response => this.handleResponse(response))
    );
  }

  deleteAccommodation(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'error') {
          throw new Error(response.message || 'Delete failed');
        }
        return;
      })
    );
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.status === 'success') {
      return response.data;
    } else {
      const errorMessage = response.message || 'Server Error';
      throw new Error(errorMessage);
    }
  }
}
