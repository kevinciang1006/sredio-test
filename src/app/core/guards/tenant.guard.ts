import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { TENANTS } from '../constants/tenants.const';

export const isValidTenant = (tenantId: string): boolean =>
  TENANTS.some(t => t.id === tenantId);

export const tenantGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const tenantId: string = route.params['tenantId'] ?? '';
  return isValidTenant(tenantId) ? true : inject(Router).parseUrl('/login');
};
