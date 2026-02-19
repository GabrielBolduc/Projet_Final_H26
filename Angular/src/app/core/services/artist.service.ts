import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Artist } from '../models/artist';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/artists'; 

  getArtists(): Observable<Artist[]> {
    return this.http.get<ApiResponse<Artist[]>>(this.API_URL).pipe(
      map(response => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Erreur chargement artistes');
        }
      })
    );
  }
}