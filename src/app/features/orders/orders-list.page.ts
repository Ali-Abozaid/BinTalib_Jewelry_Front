import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/services/orders.store';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadgeComponent],
  templateUrl: './orders-list.page.html',
  styleUrl: './orders-list.page.scss'
})
export class OrdersListPageComponent implements OnInit {
  protected readonly store = inject(OrdersStore);
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  ngOnInit(): void {
    this.store.loadOrders();
  }

  get canCreate(): boolean {
    const r = this.auth.role();
    return r === 'Admin' || r === 'Branch';
  }
}
