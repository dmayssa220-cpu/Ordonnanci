import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

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
    path: 'dashboard-patient',
    loadComponent: () =>
      import('./pages/dashboard-patient/dashboard-patient.page').then((m) => m.DashboardPatientPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient'] },
  },
  {
    path: 'dashboard-medecin',
    loadComponent: () =>
      import('./pages/dashboard-medecin/dashboard-medecin.page').then((m) => m.DashboardMedecinPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['medecin'] },
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then((m) => m.AdminPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },

  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then((m) => m.NotificationsPage),
    canActivate: [AuthGuard],
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

  {
    path: 'medecins',
    loadComponent: () => import('./pages/medecins/medecins.page').then((m) => m.MedecinsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'medecins/:id/creneaux',
    loadComponent: () => import('./pages/medecins/creneaux/creneaux.page').then((m) => m.CreneauxPage),
    canActivate: [AuthGuard],
  },

  {
    path: 'rendez-vous',
    loadComponent: () => import('./pages/rendez-vous/rendez-vous.page').then((m) => m.RendezVousPage),
    canActivate: [AuthGuard],
  },

  {
    path: 'ordonnances',
    loadComponent: () => import('./pages/ordonnances/ordonnances.page').then((m) => m.OrdonnancesPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'ordonnances/scanner',
    loadComponent: () =>
      import('./pages/ordonnances/scanner-ordonnance/scanner-ordonnance.page').then(
        (m) => m.ScannerOrdonnancePage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'ordonnances/:id/valider',
    loadComponent: () =>
      import('./pages/ordonnances/valider-ordonnance/valider-ordonnance.page').then(
        (m) => m.ValiderOrdonnancePage
      ),
    canActivate: [AuthGuard],
  },

  
  { path: 'patient/dashboard', redirectTo: 'dashboard-patient' },
  { path: 'medecin/dashboard', redirectTo: 'dashboard-medecin' },
  { path: 'admin/dashboard', redirectTo: 'admin' },

  { path: '**', redirectTo: 'connexion' },
];


