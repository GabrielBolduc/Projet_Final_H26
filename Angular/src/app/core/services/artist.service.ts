import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { Artist } from '../models/artist';
import { ApiResponse } from '../models/api-response';

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/artists';

  getGenres(): Observable<string[]>{
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/genres`).pipe(
      map(response =>{
        if (response.status === 'success') return response.data || []
        throw response
      }),
      catchError(error => throwError(() => error))
    )
  }

  getArtists(paramsObj?: { search?: string; genre?: string; headliners?: boolean; scheduled?: boolean }): Observable<Artist[]> {
    let params = new HttpParams();

    if (paramsObj) {
      if (paramsObj.search) params = params.set('search', paramsObj.search);
      if (paramsObj.genre) params = params.set('genre', paramsObj.genre);
    }

    return this.http.get<ApiResponse<Artist[]>>(this.API_URL, { params }).pipe(
      map(response => {
        if (response.status === 'success') return response.data || []
        throw response;
      }),
      catchError(error => throwError(() => error))
    )
  }

  getArtist(id: number): Observable<Artist>{
    return this.http.get<ApiResponse<Artist>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.status === 'success') return response.data!;
        throw response;
      }),
      catchError(error => throwError(() => error))
    )
  }

  createArtist(artist: Partial<Artist>, imageFile?: File): Observable<any>{
    const formData = this.buildFormData(artist, imageFile)

    return this.http.post<ApiResponse<any>>(this.API_URL, formData).pipe(
      map(response => {
        if(response.status === 'success') return response;
        throw response;
      }),
      catchError(error => throwError(() => error))
    )
  }

  updateArtist(id: number, artist: Partial<Artist>, imageFile?: File): Observable<any>{
    const formData = this.buildFormData(artist, imageFile)

    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}`, formData).pipe(
      map(response => {
        if (response.status === 'success') return response;
        throw response;
      }),
      catchError(error => throwError(() => error))
    )
  }

  deleteArtist(id: number): Observable<any>{
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if(response.status === 'success') return response;
        throw response;
      }),
      catchError(error => throwError(() => error))
    )
  }

  private buildFormData(artist: Partial<Artist>, imageFile?: File): FormData {
    const formData = new FormData()

    if (artist.name) formData.append('artist[name]', artist.name);
    if (artist.genre) formData.append('artist[genre]', artist.genre);
    if (artist.bio) formData.append('artist[bio]', artist.bio);
    if (artist.popularity !== undefined) formData.append('artist[popularity]', artist.popularity.toString());

    if (imageFile){
      formData.append('artist[image]', imageFile)
    }

    return formData
  }
}