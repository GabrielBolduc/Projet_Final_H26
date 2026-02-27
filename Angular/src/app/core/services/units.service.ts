import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Unit } from '../models/unit';
import { ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private http = inject(HttpClient);
  private readonly BASE_URL = '/api';

  getUnitsByAccommodation(accommodationId: number): Observable<ApiResponse<Unit[]>> {
    return this.http.get<ApiResponse<Unit[]>>(
      `${this.BASE_URL}/accommodations/${accommodationId}/units`
    );
  }

  createUnit(accommodationId: number, unit: Partial<Unit>, image: File): Observable<Unit> {
    const formData = this.prepareFormData(unit, image);
    return this.http.post<ApiResponse<Unit>>(
      `${this.BASE_URL}/accommodations/${accommodationId}/units`, 
      formData
    ).pipe(map(res => this.handleResponse(res)));
  }

  getUnit(unitId: number): Observable<Unit> {
    return this.http.get<ApiResponse<Unit>>(`${this.BASE_URL}/units/${unitId}`).pipe(
      map(res => this.handleResponse(res))
    );
  }

  updateUnit(unitId: number, unit: Partial<Unit>, image?: File): Observable<Unit> {
    const formData = this.prepareFormData(unit, image);
    return this.http.patch<ApiResponse<Unit>>(`${this.BASE_URL}/units/${unitId}`, formData).pipe(
      map(res => this.handleResponse(res))
    );
  }

  deleteUnit(unitId: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.BASE_URL}/units/${unitId}`).pipe(
      map(res => {
        if (res.status === 'error') throw new Error(res.message);
        return;
      })
    );
  }

  private prepareFormData(unit: Partial<Unit>, image?: File): FormData {
    const formData = new FormData();
    
    Object.keys(unit).forEach(key => {
      const value = (unit as any)[key];
      
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(`unit[${key}][]`, item));
      } 

      else if (value !== undefined && value !== null) {
        formData.append(`unit[${key}]`, value.toString());
      }
    });

    if (image) {
      formData.append('unit[image]', image, image.name);
    }
    return formData;
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.status === 'success') {
      return response.data;
    } else {
      throw new Error(response.message || 'An unknown error occurred');
    }
  }
}
