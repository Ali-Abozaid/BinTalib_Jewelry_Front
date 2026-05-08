import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/services/orders.store';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AssignWorkshopPayload, RepairOrder } from '../../core/models/order.model';

function todayLocalIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Component({
  selector: 'app-workshop-assignment-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './workshop-assignment.page.html',
  styleUrl: './workshop-assignment.page.scss'
})
export class WorkshopAssignmentPageComponent implements OnInit {
  private readonly store = inject(OrdersStore);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  protected readonly workshops = this.store.workshops;

  /** Orders awaiting workshop assignment (freshly created, not yet sent). */
  protected readonly pendingOrders = computed<RepairOrder[]>(() =>
    this.store.orders().filter((o) => o.status === 'Created')
  );

  protected readonly activeOrderId = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    workshopType: ['Internal' as 'Internal' | 'External', Validators.required],
    workshopId: [''],
    newWorkshopName: [''],
    workshopCourierName: [''],
    deliveryToWorkshopDate: [todayLocalIso()],
    externalProviderName: [''],
    note: ['']
  });

  ngOnInit(): void {
    this.store.loadOrders();
    this.store.loadLookups();
  }

  toggle(orderId: string): void {
    if (this.activeOrderId() === orderId) {
      this.activeOrderId.set(null);
      return;
    }
    this.activeOrderId.set(orderId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const order = this.store.getOrderById(orderId);
    this.form.reset({
      workshopType: order?.isExternal ? 'External' : 'Internal',
      workshopId: '',
      newWorkshopName: '',
      workshopCourierName: '',
      deliveryToWorkshopDate: todayLocalIso(),
      externalProviderName: order?.externalProviderName ?? '',
      note: ''
    });
  }

  submit(orderId: string): void {
    const value = this.form.getRawValue();
    const isExternal = value.workshopType === 'External';

    if (isExternal) {
      const name = (value.externalProviderName ?? '').trim();
      if (!name) {
        this.errorMessage.set(
          this.lang.isArabic() ? 'أدخل اسم الورشة الخارجية' : 'Please enter the external workshop name'
        );
        return;
      }
    } else {
      if (!value.workshopId && !((value.newWorkshopName ?? '').trim())) {
        this.errorMessage.set(
          this.lang.isArabic()
            ? 'اختر ورشة من القائمة أو أدخل اسم ورشة جديد'
            : 'Pick a workshop from the list or enter a new workshop name'
        );
        return;
      }
    }

    const payload: AssignWorkshopPayload = isExternal
      ? {
          isExternal: true,
          externalProviderName: (value.externalProviderName ?? '').trim(),
          note: value.note || undefined
        }
      : {
          isExternal: false,
          workshopId: value.workshopId || null,
          newWorkshopName:
            !value.workshopId && value.newWorkshopName ? value.newWorkshopName.trim() : undefined,
          workshopCourierName: value.workshopCourierName || undefined,
          deliveryToWorkshopDate: value.deliveryToWorkshopDate || undefined,
          note: value.note || undefined
        };

    this.busy.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.store.assignWorkshop(orderId, payload).subscribe({
      next: () => {
        this.busy.set(false);
        this.activeOrderId.set(null);
        this.successMessage.set(
          this.lang.isArabic() ? 'تم تحديد الورشة وإرسال الطلب' : 'Workshop assigned and order sent'
        );
      },
      error: (err) => {
        this.busy.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Failed to assign workshop');
      }
    });
  }
}
