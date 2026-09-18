import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UtilisateurAdmin {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  estActif: boolean;
}

export interface MedicamentReferentiel {
  _id: string;
  nom: string;
  dosagesDisponibles: string[];
  interactionsConnues: string[];
}

export interface Statistiques {
  utilisateurs: { nombrePatients: number; nombreMedecins: number; nombreComptesActifs: number };
  prescriptions: {
    nombrePrescriptions: number;
    prescriptionsValidees: number;
    prescriptionsCorrigees: number;
    tauxReussiteOCR: number | null;
  };
  nombreRendezVous: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  getUsers(): Observable<{ utilisateurs: UtilisateurAdmin[] }> {
    return this.api.get('/admin/users');
  }

  toggleUserStatus(id: string): Observable<{ utilisateur: UtilisateurAdmin }> {
    return this.api.patch(`/admin/users/${id}/statut`);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.api.delete(`/admin/users/${id}`);
  }

  getReferentiel(): Observable<{ medicaments: MedicamentReferentiel[] }> {
    return this.api.get('/admin/referentiel-medicaments');
  }

  createReferentiel(donnees: {
    nom: string;
    dosagesDisponibles: string[];
    interactionsConnues: string[];
  }): Observable<{ medicament: MedicamentReferentiel }> {
    return this.api.post('/admin/referentiel-medicaments', donnees);
  }

  deleteReferentiel(id: string): Observable<{ message: string }> {
    return this.api.delete(`/admin/referentiel-medicaments/${id}`);
  }

  getStatistiques(): Observable<Statistiques> {
    return this.api.get('/admin/statistiques');
  }
}
