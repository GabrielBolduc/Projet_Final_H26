import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task } from '@core/models/task';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';

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
    console.log()
        return this.http.get<ApiResponse<Task[]>>('api/tasks/' ).pipe(
             map(response => {
              if (response.status === 'success') {
                return response.data;
              } else {
                throw new Error(response.message || 'erreur api');
              }
        })
      );
    }

  getTask(id: number) {
    return this.http.get(`/tasks/${id}`);
  }

  createTask(task: any) {
    return this.http.post('/tasks', { task });
  }
  
  updateTask(id: number, task: any) {
    return this.http.put(`/tasks/${id}`, { task });
  }

  deleteTask(id: number) {
    return this.http.delete(`/tasks/${id}`);
  }
  
}
