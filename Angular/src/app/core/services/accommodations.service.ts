import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccommodationsService {
  private http = inject(HttpClient); 
  private readonly API_URL = 'http://localhost:3000/api/accommodations'; 

  getAccommodations(category: string): Observable<any> {
    const params = new HttpParams().set('category', category);
    return this.http.get<any>(this.API_URL, { params });
  }
}