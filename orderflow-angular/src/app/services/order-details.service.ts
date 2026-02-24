import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { OrderDetails } from '../models/order-details.model';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsService {

  private apiUrl = environment.apiUrl; // http://localhost:8080/api/orderdetails

  constructor(private http: HttpClient) {}

  /** GET /api/orderdetails — fetch all orders */
  getAll(): Observable<OrderDetails[]> {
    return this.http.get<OrderDetails[]>(this.apiUrl)
      .pipe(retry(1), catchError(this.handleError));
  }

  /** GET /api/orderdetails/:id — fetch single order */
  getById(id: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** POST /api/orderdetails — create order */
  create(order: OrderDetails): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(this.apiUrl, order)
      .pipe(catchError(this.handleError));
  }

  /** PUT /api/orderdetails/:id — update order */
  update(id: number, order: OrderDetails): Observable<OrderDetails> {
    return this.http.put<OrderDetails>(`${this.apiUrl}/${id}`, order)
      .pipe(catchError(this.handleError));
  }

  /** DELETE /api/orderdetails/:id — delete order */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred';
    if (error.status === 0) {
      msg = 'Cannot reach server. Is Spring Boot running on port 8080?';
    } else if (error.status === 404) {
      msg = 'Order not found.';
    } else if (error.status === 400) {
      msg = 'Invalid data. Please check your inputs.';
    } else {
      msg = `Server error ${error.status}: ${error.message}`;
    }
    return throwError(() => new Error(msg));
  }
}
