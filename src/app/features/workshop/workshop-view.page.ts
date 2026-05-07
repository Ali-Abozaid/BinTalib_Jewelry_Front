import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/services/orders.store';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ImageUploadComponent } from '../../shared/components/image-upload.component';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';
import { FilesApi } from '../../core/api/files.api';
import { RepairOrder } from '../../core/models/order.model';

@Component({
  selector: 'app-workshop-view-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink, StatusBadgeComponent, ImageUploadComponent],
  templateUrl: './workshop-view.page.html',
  styleUrl: './workshop-view.page.scss'
})
export class WorkshopViewPageComponent implements OnInit {
  private readonly store = inject(OrdersStore);
  private readonly filesApi = inject(FilesApi);
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  absoluteUrl(value: string | null | undefined): string | null {
    return this.filesApi.toAbsoluteUrl(value ?? null);
  }

  protected readonly orders = computed(() =>
    this.store
      .orders()
      .filter((o) =>
        o.status === 'SentToWorkshop' || o.status === 'InProgress' || o.status === 'Completed'
      )
  );

  protected readonly selectedOrderId = signal<string>('');
  protected readonly selectedStatus = signal<'InProgress' | 'Completed'>('InProgress');
  protected readonly workshopPrice = signal<number | null>(null);
  protected readonly afterWeight = signal<number | null>(null);
  protected readonly afterImageUrl = signal<string>('');
  protected readonly note = signal<string>('');
  protected readonly busy = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly selectedOrder = computed<RepairOrder | undefined>(() => {
    const all = this.orders();
    return all.find((o) => o.id === this.selectedOrderId()) ?? all[0];
  });

  ngOnInit(): void {
    this.store.loadOrders();
  }

  updateOrder(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.busy.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.store
      .workshopUpdate(order.id, {
        status: this.selectedStatus(),
        price: order.pricingType === 'Workshop' ? this.workshopPrice() ?? undefined : undefined,
        weightAfter: this.afterWeight() ?? undefined,
        imageAfterUrl: this.afterImageUrl() || undefined,
        note: this.note() || undefined
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.successMessage.set(this.lang.isArabic() ? 'تم التحديث' : 'Updated successfully');
          this.note.set('');
        },
        error: (err) => {
          this.busy.set(false);
          this.errorMessage.set(err?.error?.error ?? 'Failed to update');
        }
      });
  }
}
