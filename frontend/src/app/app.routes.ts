/*import { Routes } from '@angular/router';
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
  {
    path: 'rendez-vous',
    loadComponent: () =>
      import('./pages/rendez-vous/rendez-vous.page').then((m) => m.RendezVousPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'medecins',
    loadComponent: () => import('./pages/medecins/medecins.page').then((m) => m.MedecinsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'medecins/:id/creneaux',
    loadComponent: () =>
      import('./pages/medecins/creneaux/creneaux.page').then((m) => m.CreneauxPage),
    canActivate: [AuthGuard],
  },

  
  { path: 'patient/dashboard', redirectTo: 'profil' },
  { path: 'medecin/dashboard', redirectTo: 'profil' },
  { path: 'admin/dashboard', redirectTo: 'profil' },

  
  { path: '**', redirectTo: 'connexion' },
  {
    path: 'ordonnances',
    loadComponent: () => import('./pages/ordonnances/ordonnances.page').then( m => m.OrdonnancesPage)
  },
  {
    path: 'scanner-ordonnance',
    loadComponent: () => import('./pages/ordonnances/scanner-ordonnance/scanner-ordonnance.page').then( m => m.ScannerOrdonnancePage)
  },
  {
    path: 'valider-ordonnance',
    loadComponent: () => import('./pages/ordonnances/valider-ordonnance/valider-ordonnance.page').then( m => m.ValiderOrdonnancePage)
  },

];*/
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

  // Anciennes redirections conservées par sécurité
  { path: 'patient/dashboard', redirectTo: 'profil' },
  { path: 'medecin/dashboard', redirectTo: 'profil' },
  { path: 'admin/dashboard', redirectTo: 'profil' },

  { path: '**', redirectTo: 'connexion' },
];

