import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/connexion/connexion.page').then((m) => m.ConnexionPage),
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/inscription/inscription.page').then((m) => m.InscriptionPage),
  },
  {
    path: 'profil',
    loadComponent: () => import('./pages/profil/profil.page').then((m) => m.ProfilPage),
    canActivate: [AuthGuard],
  },
  
  { path: 'patient/dashboard', redirectTo: 'profil' },
  { path: 'medecin/dashboard', redirectTo: 'profil' },
  { path: 'admin/dashboard', redirectTo: 'profil' },
];
