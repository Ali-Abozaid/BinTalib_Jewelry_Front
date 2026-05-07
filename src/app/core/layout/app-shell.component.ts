import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiLanguageService } from '../services/ui-language.service';
import { AuthService } from '../auth/auth.service';
import { OrdersStore } from '../services/orders.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent implements OnInit {
  protected readonly lang = inject(UiLanguageService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly store = inject(OrdersStore);

  protected readonly user = this.auth.user;
  protected readonly isAdmin = computed(() => this.auth.role() === 'Admin');
  protected readonly isBranch = computed(() => this.auth.role() === 'Branch');
  protected readonly isWorkshop = computed(() => this.auth.role() === 'Workshop');

  ngOnInit(): void {
    this.store.loadAll();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
