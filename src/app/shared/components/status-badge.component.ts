import { Component, Input, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { OrderStatus } from '../../core/models/order.model';
import { UiLanguageService } from '../../core/services/ui-language.service';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span class="status-badge" [ngClass]="cssClass">{{ label }}</span>`,
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;
  private readonly lang = inject(UiLanguageService);

  get cssClass(): string {
    return this.status
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
  }

  get label(): string {
    if (this.lang.isArabic()) {
      const map: Record<OrderStatus, string> = {
        Created: 'تم الإنشاء',
        SentToWorkshop: 'تم الإرسال للورشة',
        InProgress: 'قيد الصيانة',
        Completed: 'تم الانتهاء',
        ReceivedFromWorkshop: 'تم الاستلام من الورشة',
        SentToExternal: 'إصلاح خارجي',
        ReceivedFromExternal: 'تم الاستلام من الخارج',
        DeliveredToCustomer: 'تم التسليم للعميل',
        Cancelled: 'تم الإلغاء'
      };
      return map[this.status];
    }

    return this.status
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (c) => c.toUpperCase());
  }
}
