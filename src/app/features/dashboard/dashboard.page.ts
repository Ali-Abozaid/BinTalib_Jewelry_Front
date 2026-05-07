import { Component, OnInit, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/services/orders.store';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadgeComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(OrdersStore);
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  protected readonly stats = this.store.stats;
  protected readonly loading = this.store.loading;
  protected readonly recentOrders = computed(() => this.store.orders().slice(0, 5));

  ngOnInit(): void {
    this.store.loadOrders();
  }
}
