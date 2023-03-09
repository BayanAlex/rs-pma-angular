import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppService } from './app.service';

export const isLoggedInGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return handleLogin(true);
}

export const isNotLoggedInGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return handleLogin(false);
}

function handleLogin(shouldBeLoggedIn: boolean) {
  const app = inject(AppService);
  if (app.isLoggedIn === shouldBeLoggedIn) {
    return true;
  } else {
    app.gotoPage('/');
    return false;
  }
}
