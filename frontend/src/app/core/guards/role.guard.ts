import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data?.['role'] as string | undefined;
  const user = auth.user();
  if (!user) return router.parseUrl('/login');
  if (!required) return true;

  // ADMIN puede acceder a todo
  if (user.role === 'ADMIN') return true;

  // USER solo puede acceder a rutas con role='USER'
  if (required === 'ADMIN') return router.parseUrl('/login');

  return true;
};
