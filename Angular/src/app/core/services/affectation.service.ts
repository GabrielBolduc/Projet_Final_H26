import { Affectation } from '@core/models/affectation';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task } from '@core/models/task';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';


interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  message?: string;
   
}
@Injectable({
  providedIn: 'root',
})
export class AffectationService {

  private http = inject(HttpClient);
  private router = inject(Router);

   listAffectationsByTask(id: number|null): Observable<Affectation[]> {
      
        return this.http.get<ApiResponse<Affectation[]>>(`api/affectations/get_by_task/${id}` ).pipe(
              map(response => {
              console.log(response)
              if (response.status === 'success') {
                return response.data;
              } else {
                throw new Error(response.message || 'erreur api');
              }
        })
      );
    }

    listAffectationsByUser(id: number|null): Observable<Affectation[]> {
    
        return this.http.get<ApiResponse<Affectation[]>>(`api/affectations/get_by_user/${id}` ).pipe(
              map(response => {
              console.log(response)
              if (response.status === 'success') {
                return response.data;
              } else {
                throw new Error(response.message || 'erreur api');
              }
        })
      );
    }
  
    getAffectation(id: number|null): Observable<Affectation> {
        return this.http.get<ApiResponse<Affectation>>(`api/affectations/${id}` ).pipe(
             map(response => {
              console.log(response)
              if (response.status === 'success') {
                return response.data;
              } else {
                throw new Error(response.message || 'erreur api');
              }
        })
      );
    }

     createAffectation(affectation: FormData) {
  
        return this.http.post<ApiResponse<Affectation>>(`api/affectations`, affectation).pipe(
    
          map(response => {
                    console.log(response)
                    if (response.status === 'success') {
                      return response.data;
                    } else {
                      throw new Error(response.message || 'erreur api');
                    }
              })
            );  
    
      }

      updateAffectation(id: number, affectation: FormData) {
        return this.http.patch<ApiResponse<Affectation>>(`api/affectations/${id}`, affectation).pipe(
          map(response => {
                    console.log(response)
                    if (response.status === 'success') {
                      return response.data;
                    } else {
                      throw new Error(response.message || 'erreur api');
                    }
              })
            );
          }

      deleteAffectation(id: number) {
        return this.http.delete<ApiResponse<null>>(`api/affectations/${id}`).pipe(
           map(response => {
                    console.log(response)
                    if (response.status === 'success') {
                      return response.data;
                    } else {
                      throw new Error(response.message || 'erreur api');
                    }
              })
            );
      }

}
