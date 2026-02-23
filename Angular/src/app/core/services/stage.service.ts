import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Stage } from '../models/stage';
import { environment } from '../../../environments/environment';
interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T
  message?: string
}

@Injectable({providedIn: 'root'})
export class StageService {
  private http = inject(HttpClient)
  private readonly API_URL = `${environment.apiUrl}/stages`

  getStages(): Observable<Stage[]> {
    return this.http.get<ApiResponse<Stage[]>>(this.API_URL).pipe(
      map(response => {
        if(response.status === 'success'){
          return response.data
        }else{
          throw new Error(response.message || 'Error loading stage')
        }
      })
    )
  }
}