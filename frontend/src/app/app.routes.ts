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
  
   {
    path: 'medicaments',
    loadComponent: () => import('./pages/medicaments/medicaments.page').then((m) => m.MedicamentsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'medicaments/ajouter',
    loadComponent: () =>
      import('./pages/medicaments/ajouter-medicament/ajouter-medicament.page').then(
        (m) => m.AjouterMedicamentPage
      ),
    canActivate: [AuthGuard],
  },

  {
    path: 'rappels',
    loadComponent: () => import('./pages/rappels/rappels.page').then((m) => m.RappelsPage),
    canActivate: [AuthGuard],
  },

  
  { path: 'patient/dashboard', redirectTo: 'profil' },
  { path: 'medecin/dashboard', redirectTo: 'profil' },
  { path: 'admin/dashboard', redirectTo: 'profil' },

  
  { path: '**', redirectTo: 'connexion' },


];
