import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Unit } from '../models/unit';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  code?: number;   
}

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private http = inject(HttpClient);
  private readonly ACCOM_URL = '/api/accommodations';
  private readonly UNIT_URL = '/api/units';

  createUnit(accommodationId: number, unit: Partial<Unit>, image: File): Observable<Unit> {
    const formData = this.prepareFormData(unit, image);
    return this.http.post<ApiResponse<Unit>>(`${this.ACCOM_URL}/${accommodationId}/units`, formData).pipe(
      map(response => this.handleResponse(response))
    );
  }

  updateUnit(unitId: number, unit: Partial<Unit>, image?: File): Observable<Unit> {
    const formData = this.prepareFormData(unit, image);
    return this.http.patch<ApiResponse<Unit>>(`${this.UNIT_URL}/${unitId}`, formData).pipe(
      map(response => this.handleResponse(response))
    );
  }

  deleteUnit(unitId: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.UNIT_URL}/${unitId}`).pipe(
      map(response => {
        if (response.status === 'error') throw new Error(response.message);
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
      } else if (value !== undefined && value !== null) {
        formData.append(`unit[${key}]`, value);
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
      throw new Error(response.message || `Error ${response.code}`);
    }
  }
}
