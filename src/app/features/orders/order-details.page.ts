import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../../core/services/orders.store';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ImageUploadComponent } from '../../shared/components/image-upload.component';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';
import { FilesApi } from '../../core/api/files.api';
import { OrderStatus, RepairOrder } from '../../core/models/order.model';

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, StatusBadgeComponent, ImageUploadComponent],
  templateUrl: './order-details.page.html',
  styleUrl: './order-details.page.scss'
})
export class OrderDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(OrdersStore);
  private readonly filesApi = inject(FilesApi);
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  absoluteUrl(value: string | null | undefined): string | null {
    return this.filesApi.toAbsoluteUrl(value ?? null);
  }

  protected readonly orderId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  protected readonly localOrder = signal<RepairOrder | null>(null);

  protected readonly order = computed(() => this.localOrder() ?? this.store.getOrderById(this.orderId() ?? null));

  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly otpInput = signal('');
  protected readonly externalProvider = signal('');
  protected readonly afterWeight = signal<number | null>(null);
  protected readonly afterImageUrl = signal('');
  protected readonly workshopPriceInput = signal<number | null>(null);
  protected readonly externalPriceInput = signal<number | null>(null);
  protected readonly receiveNote = signal('');

  protected readonly canBranchAct = computed(() => {
    const role = this.auth.role();
    return role === 'Admin' || role === 'Branch';
  });

  protected readonly canWorkshopAct = computed(() => {
    const role = this.auth.role();
    return role === 'Admin' || role === 'Workshop';
  });

  protected readonly canReceiveFromWorkshop = computed(() => {
    const o = this.order();
    return !!o && (o.status === 'Completed' || o.status === 'InProgress');
  });

  protected readonly canMoveToExternal = computed(() => {
    const o = this.order();
    return !!o && o.status !== 'DeliveredToCustomer' && o.status !== 'Cancelled' && o.status !== 'SentToExternal';
  });

  protected readonly canReceiveFromExternal = computed(() => {
    const o = this.order();
    return !!o && o.status === 'SentToExternal';
  });

  protected readonly canVerifyOtp = computed(() => {
    const o = this.order();
    return !!o && (o.status === 'ReceivedFromWorkshop' || o.status === 'ReceivedFromExternal');
  });

  ngOnInit(): void {
    const id = this.orderId();
    if (id) {
      this.store.refreshOrder(id).subscribe({
        next: (o) => this.localOrder.set(o),
        error: () => {}
      });
    }
  }

  refresh(): void {
    const id = this.orderId();
    if (!id) return;
    this.store.refreshOrder(id).subscribe((o) => this.localOrder.set(o));
  }

  workshopUpdate(status: 'InProgress' | 'Completed'): void {
    const o = this.order();
    if (!o) return;
    this.runAction(
      () => this.store.workshopUpdate(o.id, {
        status,
        price: this.workshopPriceInput() ?? undefined,
        weightAfter: this.afterWeight() ?? undefined,
        imageAfterUrl: this.afterImageUrl() || undefined
      }),
      this.lang.isArabic() ? 'تم التحديث' : 'Updated successfully'
    );
  }

  receiveFromWorkshop(): void {
    const o = this.order();
    if (!o) return;
    this.runAction(
      () => this.store.receiveFromWorkshop(o.id, {
        weightAfter: this.afterWeight() ?? undefined,
        imageAfterUrl: this.afterImageUrl() || undefined,
        note: this.receiveNote() || undefined
      }),
      this.lang.isArabic() ? 'تم الاستلام وإرسال OTP عبر واتساب' : 'Received. OTP sent via WhatsApp'
    );
  }

  moveToExternal(): void {
    const o = this.order();
    if (!o) return;
    const provider = this.externalProvider().trim();
    if (!provider) {
      this.errorMessage.set(this.lang.isArabic() ? 'أدخل اسم جهة الإصلاح الخارجي' : 'Enter external provider name');
      return;
    }
    this.runAction(
      () => this.store.moveToExternal(o.id, { externalProviderName: provider, note: this.receiveNote() || undefined }),
      this.lang.isArabic() ? 'تم تحويل القطعة للإصلاح الخارجي' : 'Moved to external repair'
    );
  }

  receiveFromExternal(): void {
    const o = this.order();
    if (!o) return;
    this.runAction(
      () => this.store.receiveFromExternal(o.id, {
        weightAfter: this.afterWeight() ?? undefined,
        imageAfterUrl: this.afterImageUrl() || undefined,
        price: this.externalPriceInput() ?? undefined,
        note: this.receiveNote() || undefined
      }),
      this.lang.isArabic() ? 'تم الاستلام من الجهة الخارجية وإرسال OTP' : 'Received from external. OTP sent'
    );
  }

  verifyOtp(): void {
    const o = this.order();
    if (!o) return;
    const otp = this.otpInput().trim();
    if (!otp) {
      this.errorMessage.set(this.lang.isArabic() ? 'أدخل رمز OTP' : 'Enter OTP code');
      return;
    }
    this.runAction(
      () => this.store.verifyOtp(o.id, otp),
      this.lang.isArabic() ? 'تم تسليم القطعة للعميل' : 'Item delivered to customer'
    );
    this.otpInput.set('');
  }

  cancel(): void {
    const o = this.order();
    if (!o) return;
    if (!confirm(this.lang.isArabic() ? 'هل أنت متأكد من إلغاء الطلب؟' : 'Cancel this order?')) return;
    this.runAction(
      () => this.store.cancel(o.id, this.receiveNote() || undefined),
      this.lang.isArabic() ? 'تم الإلغاء' : 'Order cancelled'
    );
  }

  formatStatus(status: OrderStatus): string {
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private runAction<T>(fn: () => { subscribe: (h: { next: (v: T) => void; error: (e: unknown) => void }) => unknown }, success: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    fn().subscribe({
      next: (value) => {
        this.busy.set(false);
        const candidate = value as unknown as Partial<RepairOrder> | null | undefined;
        if (candidate && typeof candidate === 'object' && typeof candidate.id === 'string') {
          this.localOrder.set(candidate as RepairOrder);
        } else {
          this.refresh();
        }
        this.successMessage.set(success);
      },
      error: (err: unknown) => {
        this.busy.set(false);
        const e = err as { error?: { error?: string } } | undefined;
        this.errorMessage.set(e?.error?.error ?? 'Action failed');
      }
    });
  }
}
