import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task } from '@core/models/task';
import { Router } from 'node_modules/@angular/router/types/_router_module-chunk';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private router = inject(Router);

  listTasks(): Observable<Task[]> {
    console.log()
          return this.http.get<Task[]>('api/tasks/' ).pipe(
              catchError((response: HttpErrorResponse) => {
                  console.log(response,"ok")
                  throw response;
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
