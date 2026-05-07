import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workshop } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class WorkshopsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/Workshops`;

  list(): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(this.base);
  }

  create(payload: { name: string; address?: string; phone?: string }): Observable<Workshop> {
    return this.http.post<Workshop>(this.base, payload);
  }
}
