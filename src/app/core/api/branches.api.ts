import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Branch } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class BranchesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/Branches`;

  list(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.base);
  }

  create(payload: { name: string; address?: string; phone?: string }): Observable<Branch> {
    return this.http.post<Branch>(this.base, payload);
  }
}
