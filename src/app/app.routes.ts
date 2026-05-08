import { Routes } from '@angular/router';

import { AppShellComponent } from './core/layout/app-shell.component';
import { CreateOrderPageComponent } from './features/orders/create-order.page';
import { OrderDetailsPageComponent } from './features/orders/order-details.page';
import { OrdersListPageComponent } from './features/orders/orders-list.page';
import { DashboardPageComponent } from './features/dashboard/dashboard.page';
import { LoginPageComponent } from './features/auth/login.page';
import { WorkshopViewPageComponent } from './features/workshop/workshop-view.page';
import { WorkshopAssignmentPageComponent } from './features/workshop-assignment/workshop-assignment.page';
import { authGuard, roleGuard } from './core/auth/guards';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent,
        canActivate: [roleGuard(['Admin'])]
      },
      {
        path: 'orders/new',
        component: CreateOrderPageComponent,
        canActivate: [roleGuard(['Admin', 'Branch'])]
      },
      { path: 'orders', component: OrdersListPageComponent },
      { path: 'orders/:id', component: OrderDetailsPageComponent },
      {
        path: 'workshop-assignment',
        component: WorkshopAssignmentPageComponent,
        canActivate: [roleGuard(['Admin', 'Branch'])]
      },
      {
        path: 'workshop',
        component: WorkshopViewPageComponent,
        canActivate: [roleGuard(['Admin', 'Workshop'])]
      },
      { path: '', pathMatch: 'full', redirectTo: 'orders' }
    ]
  },
  { path: '**', redirectTo: 'orders' }
];
