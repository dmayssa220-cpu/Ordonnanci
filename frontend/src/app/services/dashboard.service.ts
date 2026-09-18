import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface MedicamentDashboard {
  _id: string;
  nom: string;
  dosage: string;
  frequence: string;
}

export interface RendezVousDashboard {
  _id: string;
  date: string;
  medecinId?: { nom: string; prenom: string };
  patientId?: { nom: string; prenom: string };
}

export interface DashboardPatient {
  traitementsEnCours: MedicamentDashboard[];
  prochainsRendezVous: RendezVousDashboard[];
  tauxObservanceGlobal: number | null;
}

export interface AlerteInobservance {
  patient: { nom: string; prenom: string };
  tauxObservance: number;
}

export interface DashboardMedecin {
  agendaDuJour: RendezVousDashboard[];
  nombrePatients: number;
  alertesInobservance: AlerteInobservance[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService, private http: HttpClient) {}

  getDashboardPatient(): Observable<DashboardPatient> {
    return this.api.get('/dashboard/patient');
  }

  getDashboardMedecin(): Observable<DashboardMedecin> {
    return this.api.get('/dashboard/medecin');
  }

  /** Nécessite un appel HttpClient direct (responseType: 'blob' non supporté par ApiService.get). */
  telechargerExportPdf(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/dashboard/patient/export-pdf`, { responseType: 'blob' });
  }
}
