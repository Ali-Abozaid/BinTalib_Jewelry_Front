import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { BranchesApi } from '../api/branches.api';
import { CustomersApi } from '../api/customers.api';
import { OrdersApi } from '../api/orders.api';
import { WorkshopsApi } from '../api/workshops.api';
import {
  Branch,
  CreateOrderPayload,
  Customer,
  MoveToExternalPayload,
  OrderStats,
  ReceiveFromExternalPayload,
  ReceiveFromWorkshopPayload,
  RepairOrder,
  Workshop,
  WorkshopUpdatePayload
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly ordersApi = inject(OrdersApi);
  private readonly branchesApi = inject(BranchesApi);
  private readonly workshopsApi = inject(WorkshopsApi);
  private readonly customersApi = inject(CustomersApi);

  private readonly ordersSignal = signal<RepairOrder[]>([]);
  private readonly branchesSignal = signal<Branch[]>([]);
  private readonly workshopsSignal = signal<Workshop[]>([]);
  private readonly customersSignal = signal<Customer[]>([]);
  private readonly statsSignal = signal<OrderStats>({
    total: 0,
    created: 0,
    inProgress: 0,
    completed: 0,
    delivered: 0,
    external: 0
  });
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly orders = this.ordersSignal.asReadonly();
  readonly branches = this.branchesSignal.asReadonly();
  readonly workshops = this.workshopsSignal.asReadonly();
  readonly customers = this.customersSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly recentOrders = computed(() => this.ordersSignal().slice(0, 5));

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({
      orders: this.ordersApi.list(),
      branches: this.branchesApi.list(),
      workshops: this.workshopsApi.list(),
      customers: this.customersApi.list(),
      stats: this.ordersApi.stats()
    }).subscribe({
      next: ({ orders, branches, workshops, customers, stats }) => {
        this.ordersSignal.set(orders);
        this.branchesSignal.set(branches);
        this.workshopsSignal.set(workshops);
        this.customersSignal.set(customers);
        this.statsSignal.set(stats);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err?.error?.error ?? 'Failed to load data');
        this.loadingSignal.set(false);
      }
    });
  }

  loadOrders(): void {
    this.ordersApi.list().subscribe({
      next: (orders) => this.ordersSignal.set(orders),
      error: (err) => this.errorSignal.set(err?.error?.error ?? 'Failed to load orders')
    });
    this.ordersApi.stats().subscribe({
      next: (stats) => this.statsSignal.set(stats)
    });
  }

  loadLookups(): void {
    this.branchesApi.list().subscribe((b) => this.branchesSignal.set(b));
    this.workshopsApi.list().subscribe((w) => this.workshopsSignal.set(w));
    this.customersApi.list().subscribe((c) => this.customersSignal.set(c));
  }

  getOrderById(id: string | null) {
    if (!id) return undefined;
    return this.ordersSignal().find((o) => o.id === id);
  }

  refreshOrder(id: string) {
    return this.ordersApi.byId(id).pipe(tap((o) => this.upsertOrder(o)));
  }

  createOrder(payload: CreateOrderPayload) {
    return this.ordersApi.create(payload).pipe(tap((o) => this.upsertOrder(o, true)));
  }

  workshopUpdate(id: string, payload: WorkshopUpdatePayload) {
    return this.ordersApi.workshopUpdate(id, payload).pipe(tap((o) => this.upsertOrder(o)));
  }

  receiveFromWorkshop(id: string, payload: ReceiveFromWorkshopPayload) {
    return this.ordersApi.receiveFromWorkshop(id, payload).pipe(tap((o) => this.upsertOrder(o)));
  }

  moveToExternal(id: string, payload: MoveToExternalPayload) {
    return this.ordersApi.moveToExternal(id, payload).pipe(tap((o) => this.upsertOrder(o)));
  }

  receiveFromExternal(id: string, payload: ReceiveFromExternalPayload) {
    return this.ordersApi.receiveFromExternal(id, payload).pipe(tap((o) => this.upsertOrder(o)));
  }

  verifyOtp(id: string, otp: string) {
    return this.ordersApi.verifyOtp(id, otp).pipe(tap((o) => this.upsertOrder(o)));
  }

  cancel(id: string, note?: string) {
    return this.ordersApi.cancel(id, note).pipe(tap(() => this.loadOrders()));
  }

  private upsertOrder(order: RepairOrder, prepend = false): void {
    const list = this.ordersSignal();
    const idx = list.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = order;
      this.ordersSignal.set(next);
    } else {
      this.ordersSignal.set(prepend ? [order, ...list] : [...list, order]);
    }
    this.ordersApi.stats().subscribe((s) => this.statsSignal.set(s));
  }
}
