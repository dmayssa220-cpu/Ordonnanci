import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Medecin {
  _id: string;
  userId: { _id: string; nom: string; prenom: string; email?: string; photoUrl?: string };
  specialite: string;
  lieuExercice?: string;
  disponibilites: { jour: string; heureDebut: string; heureFin: string }[];
}

export interface RendezVous {
  _id: string;
  patientId: { _id: string; nom: string; prenom: string } | string;
  medecinId: { _id: string; nom: string; prenom: string } | string;
  date: string;
  motif?: string;
  statut: 'confirme' | 'annule' | 'reporte' | 'termine';
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  rechercherMedecins(specialite?: string): Observable<{ medecins: Medecin[] }> {
    return this.api.get('/doctors', specialite ? { specialite } : undefined);
  }

  getCreneaux(medecinId: string, date: string): Observable<{ jour: string; creneaux: string[] }> {
    return this.api.get(`/doctors/${medecinId}/creneaux`, { date });
  }

  creerRendezVous(donnees: {
    medecinId: string;
    date: string;
    heure: string;
    motif?: string;
  }): Observable<{ rdv: RendezVous }> {
    return this.api.post('/appointments', donnees);
  }

  getMesRendezVous(): Observable<{ rdvs: RendezVous[] }> {
    return this.api.get('/appointments');
  }

  getAlertes(): Observable<{ rdvsAvecAlerte: { rdv: RendezVous; alerte: string }[] }> {
    return this.api.get('/appointments/alertes');
  }

  annulerRendezVous(id: string): Observable<{ rdv: RendezVous }> {
    return this.api.patch(`/appointments/${id}/annuler`);
  }

  reporterRendezVous(id: string, donnees: { date: string; heure: string }): Observable<{ rdv: RendezVous }> {
    return this.api.patch(`/appointments/${id}/reporter`, donnees);
  }

  terminerRendezVous(id: string): Observable<{ rdv: RendezVous }> {
    return this.api.patch(`/appointments/${id}/terminer`);
  }
}
