import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Festival } from '../models/festival';

@Injectable({ providedIn: 'root' })
export class FestivalService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/festivals'; 

  getFestivals(): Observable<Festival[]> {
    return this.http.get<Festival[]>(this.API_URL);
  }
}