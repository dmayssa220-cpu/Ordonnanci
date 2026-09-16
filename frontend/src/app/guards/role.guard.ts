import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolesAutorises: string[] = route.data['roles'] || [];
    const utilisateur = this.authService.utilisateurActuel;

    if (utilisateur && rolesAutorises.includes(utilisateur.role)) {
      return true;
    }

    this.router.navigate(['/accueil']);
    return false;
  }
}
