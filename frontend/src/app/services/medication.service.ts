import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Medicament {
  _id: string;
  nom: string;
  dosage: string;
  frequence: string;
  dateDebut: string;
  dateFin: string;
  source: 'manuel' | 'ia';
}

export interface Observance {
  medicationId: string;
  totalEchus: number;
  nombrePris: number;
  tauxObservance: number | null;
}

@Injectable({ providedIn: 'root' })
export class MedicationService {
  constructor(private api: ApiService) {}

  getMedicaments(): Observable<{ medicaments: Medicament[] }> {
    return this.api.get('/medications');
  }

  getMedicamentParId(id: string): Observable<{ medicament: Medicament }> {
    return this.api.get(`/medications/${id}`);
  }

  creerMedicament(donnees: {
    nom: string;
    dosage: string;
    frequence: string;
    heuresPrise: string[];
    dateDebut: string;
    dateFin?: string;
  }): Observable<{ medicament: Medicament }> {
    return this.api.post('/medications', donnees);
  }

  supprimerMedicament(id: string): Observable<{ message: string }> {
    return this.api.delete(`/medications/${id}`);
  }

  getObservance(id: string): Observable<Observance> {
    return this.api.get(`/medications/${id}/observance`);
  }
}
