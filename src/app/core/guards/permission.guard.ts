import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const permission = route.data['permission'] as string | undefined;
    const permissions = route.data['permissions'] as string[] | undefined;

    if (permission && this.authService.hasPermission(permission)) return true;
    if (permissions?.length && this.authService.hasAnyPermission(permissions)) return true;
    if (!permission && !permissions?.length) return true;

    return this.router.createUrlTree(['/403']);
  }
}
