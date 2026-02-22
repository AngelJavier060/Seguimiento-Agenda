import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required: 'ADMIN' | 'USER' | undefined = route.data?.['role'];
  const user = auth.user();
  if (!user) return router.parseUrl('/login');
  if (!required) return true;

  if (required === 'ADMIN' && user.role !== 'ADMIN') return router.parseUrl('/login');
  if (required === 'USER' && user.role !== 'USER') return router.parseUrl('/login');

  return true;
};
