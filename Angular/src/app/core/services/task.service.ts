import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task } from '@core/models/task';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { TaskPayload } from '@core/models/task-payload';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  message?: string;
  code?: number;   
}



@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private router = inject(Router);

  listTasks(): Observable<Task[]> {
    
        return this.http.get<ApiResponse<Task[]>>('api/tasks/' ).pipe(
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

     listReusableTasks(): Observable<Task[]> {
    
        return this.http.get<ApiResponse<Task[]>>('api/tasks/get_reusable' ).pipe(
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

  getTask(id: number|null): Observable<Task> {
        return this.http.get<ApiResponse<Task>>(`api/tasks/${id}` ).pipe(
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

  createTask(task: TaskPayload) {
    return this.http.post<ApiResponse<Task>>(`api/tasks`, { task }).pipe(

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
  
  updateTask(id: number|null, task: TaskPayload) {
    return this.http.patch<ApiResponse<Task>>(`api/tasks/${id}`, { task }).pipe(

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

  deleteTask(id: number|null) {
    return this.http.delete<ApiResponse<Task>>(`api/tasks/${id}`).pipe(
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
