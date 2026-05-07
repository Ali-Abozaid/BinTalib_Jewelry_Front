import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AppRole } from '../models/order.model';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  router.navigateByUrl('/login');
  return false;
};

export const roleGuard = (allowed: AppRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigateByUrl('/login');
    return false;
  }
  const role = auth.role();
  if (role && allowed.includes(role)) {
    return true;
  }
  router.navigateByUrl('/orders');
  return false;
};
