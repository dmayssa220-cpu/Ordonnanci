import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(chemin: string, params?: Record<string, string>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${chemin}`, { params });
  }

  post<T>(chemin: string, corps: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${chemin}`, corps);
  }

  put<T>(chemin: string, corps: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${chemin}`, corps);
  }

  patch<T>(chemin: string, corps: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${chemin}`, corps);
  }

  delete<T>(chemin: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${chemin}`);
  }

  /** Pour l'upload d'ordonnance (multipart/form-data) */
  postForm<T>(chemin: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${chemin}`, formData);
  }
}
