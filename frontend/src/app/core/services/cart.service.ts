import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  getCart(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addItem(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, { productId, quantity });
  }

  updateItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${itemId}`, { quantity });
  }

  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }
}
