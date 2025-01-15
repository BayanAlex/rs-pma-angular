import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AppService } from './app.service';

export const isLoggedInGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => handleLogin(true);
export const isNotLoggedInGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => handleLogin(false);

function handleLogin(shouldBeLoggedIn: boolean) {
  const authService = inject(AuthService);
  const appService = inject(AppService);
  if (authService.isLoggedIn() !== shouldBeLoggedIn) {
    appService.gotoPage('/');
    return false;
  }
  return true;
}
