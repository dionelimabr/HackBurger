import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private productsUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  // Users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }
  activateUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/activate`, {});
  }
  deactivateUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  // Products
  getAllProducts(): Observable<any> {
    return this.http.get(this.productsUrl, { params: { limit: '200' } });
  }
  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, data);
  }
  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, data);
  }
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // Orders
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`);
  }
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/status`, { status });
  }
}
