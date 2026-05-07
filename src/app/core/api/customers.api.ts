import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/Customers`;

  list(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.base);
  }

  byPhone(phone: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/by-phone`, { params: new HttpParams().set('phone', phone) });
  }

  create(payload: { name: string; phone: string; email?: string }): Observable<Customer> {
    return this.http.post<Customer>(this.base, payload);
  }
}
