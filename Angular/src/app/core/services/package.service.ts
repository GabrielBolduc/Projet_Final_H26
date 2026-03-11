import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { Package } from '../models/package';

export type PackageStatus = 'draft' | 'ongoing' | 'completed';
export type PackageSort = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';

export interface PackageFilters {
  festivalId?: number;
  status?: PackageStatus;
  q?: string;
  dow?: string;
  sort?: PackageSort;
  categories?: Array<'general' | 'daily' | 'evening'>;
  sold_out?: 'true' | 'false' | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private http = inject(HttpClient);
  
  // URL API Rails
  private readonly API_URL = '/api/packages'; 

  getPackages(filters: PackageFilters = {}): Observable<Package[]> {
    let params = new HttpParams();

    if (filters.festivalId !== undefined) {
      params = params.set('festival_id', String(filters.festivalId));
    } else if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.q?.trim()) {
      params = params.set('q', filters.q.trim());
    }

    if (filters.dow?.trim()) {
      params = params.set('dow', filters.dow.trim());
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    if (filters.sold_out !== undefined) {
      const soldOutValue = typeof filters.sold_out === 'boolean'
        ? String(filters.sold_out)
        : filters.sold_out;
      params = params.set('sold_out', soldOutValue);
    }

    if (filters.categories !== undefined) {
      if (filters.categories.length === 0) {
        params = params.append('categories[]', '__none__');
      } else {
        filters.categories.forEach((category) => {
          params = params.append('categories[]', category);
        });
      }
    }

    return this.http.get<ApiResponse<Package[]>>(this.API_URL, { params }).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }
        throw response;
      }),
      catchError(this.handleError)
    );
  }

  getPackage(id: number): Observable<Package> {
    return this.http.get<ApiResponse<Package>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }
        throw response;
      }),
      catchError(this.handleError)
    );
  }

  createPackage(pkg: Partial<Package>, file?: File): Observable<Package> {
    // Conversion FormData image
    const formData = this.toFormData(pkg, file);

    return this.http.post<ApiResponse<Package>>(this.API_URL, formData).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }
        throw response;
      }),
      catchError(this.handleError)
    );
  }

  updatePackage(id: number, pkg: Partial<Package>, file?: File): Observable<Package> {
    const formData = this.toFormData(pkg, file);

    return this.http.put<ApiResponse<Package>>(`${this.API_URL}/${id}`, formData).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        }
        throw response;
      }),
      catchError(this.handleError)
    );
  }


  deletePackage(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return;
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

  private toFormData(pkg: Partial<Package>, file?: File): FormData {
    const formData = new FormData();
    
    Object.keys(pkg).forEach(key => {
      const value = pkg[key as keyof Package];
      if (value !== null && value !== undefined) {
        formData.append(`package[${key}]`, value as any);
      }
    });

    if (file) {
      formData.append('package[image]', file);
    }
    
    return formData;
  }
}
