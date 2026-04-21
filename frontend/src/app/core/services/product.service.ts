import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  getFeatured(): Observable<any> {
    return this.http.get(`${this.apiUrl}/featured`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/slug/${slug}`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  search(query: string): Observable<any> {
    return this.http.get(this.apiUrl, { params: { search: query, limit: 8 } });
  }
}
