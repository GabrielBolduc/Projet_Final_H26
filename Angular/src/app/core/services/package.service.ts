import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Package } from '../models/package';

interface ApiResponse<T> {
  status: string;
  code?: number;
  message?: string;
  data: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private http = inject(HttpClient);
  
  // URL API Rails
  private readonly API_URL = '/api/packages'; 

  getPackages(): Observable<Package[]> {
    return this.http.get<ApiResponse<Package[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Erreur lors du chargement des forfaits');
        }
      }),
      catchError(this.handleError)
    );
  }

  getPackage(id: number): Observable<Package> {
    return this.http.get<ApiResponse<Package>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Forfait introuvable');
        }
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
        } else {
          throw { message: response.message, errors: response.errors };
        }
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
        } else {
          throw { message: response.message, errors: response.errors };
        }
      }),
      catchError(this.handleError)
    );
  }


  deletePackage(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') {
          return;
        } else {
          if (response.code === 422 && response.errors) {
             throw { message: response.message, errors: response.errors };
          }
          throw new Error(response.message || 'Erreur lors de la suppression');
        }
      }),
      catchError(this.handleError)
    );
  }


  private handleError(error: any) {
    console.error('Erreur API Package:', error);
    if (error.errors || (error.message && !error.status)) {
      return throwError(() => error);
    }
    return throwError(() => new Error(error.message || 'Erreur serveur inconnue'));
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