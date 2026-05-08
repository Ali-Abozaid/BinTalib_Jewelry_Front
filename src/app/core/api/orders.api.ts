import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignWorkshopPayload,
  CreateOrderPayload,
  MoveToExternalPayload,
  OrderStats,
  ReceiveFromExternalPayload,
  ReceiveFromWorkshopPayload,
  RepairOrder,
  WorkshopUpdatePayload
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/Orders`;

  list(): Observable<RepairOrder[]> {
    return this.http.get<RepairOrder[]>(this.base);
  }

  byId(id: string): Observable<RepairOrder> {
    return this.http.get<RepairOrder>(`${this.base}/${id}`);
  }

  stats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.base}/stats`);
  }

  create(payload: CreateOrderPayload): Observable<RepairOrder> {
    return this.http.post<RepairOrder>(this.base, payload);
  }

  assignWorkshop(id: string, payload: AssignWorkshopPayload): Observable<RepairOrder> {
    return this.http.put<RepairOrder>(`${this.base}/${id}/assign-workshop`, payload);
  }

  workshopUpdate(id: string, payload: WorkshopUpdatePayload): Observable<RepairOrder> {
    return this.http.put<RepairOrder>(`${this.base}/${id}/workshop`, payload);
  }

  receiveFromWorkshop(id: string, payload: ReceiveFromWorkshopPayload): Observable<RepairOrder> {
    return this.http.put<RepairOrder>(`${this.base}/${id}/receive-from-workshop`, payload);
  }

  moveToExternal(id: string, payload: MoveToExternalPayload): Observable<RepairOrder> {
    return this.http.put<RepairOrder>(`${this.base}/${id}/move-to-external`, payload);
  }

  receiveFromExternal(id: string, payload: ReceiveFromExternalPayload): Observable<RepairOrder> {
    return this.http.put<RepairOrder>(`${this.base}/${id}/receive-from-external`, payload);
  }

  verifyOtp(id: string, otp: string): Observable<RepairOrder> {
    return this.http.post<RepairOrder>(`${this.base}/${id}/verify-otp`, { otp });
  }

  cancel(id: string, note?: string): Observable<void> {
    const url = note ? `${this.base}/${id}?note=${encodeURIComponent(note)}` : `${this.base}/${id}`;
    return this.http.delete<void>(url);
  }
}
