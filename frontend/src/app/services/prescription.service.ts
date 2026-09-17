import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface MedicamentDetecte {
  nom: string;
  dosage: string | null;
  frequence: string | null;
  ligneOriginale?: string;
}

export interface Prescription {
  _id: string;
  imageUrl: string;
  texteExtrait: string;
  medicamentsDetectes: MedicamentDetecte[];
  statutValidation: 'en_attente' | 'validee' | 'corrigee';
  createdAt: string;
}

export interface MedicamentValide {
  nom: string;
  dosage: string;
  frequence: string;
  heuresPrise: string[];
  dateDebut: string;
  dateFin?: string;
}

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private api: ApiService) {}

  uploaderOrdonnance(blob: Blob): Observable<{ message: string; prescription: Prescription }> {
    const formData = new FormData();
    formData.append('ordonnance', blob, 'ordonnance.jpg');
    return this.api.postForm('/prescriptions', formData);
  }

  getMesOrdonnances(): Observable<{ prescriptions: Prescription[] }> {
    return this.api.get('/prescriptions');
  }

  getOrdonnance(id: string): Observable<{ prescription: Prescription }> {
    return this.api.get(`/prescriptions/${id}`);
  }

  validerOrdonnance(
    id: string,
    donnees: { medicamentsValides: MedicamentValide[]; corrige: boolean }
  ): Observable<{ message: string; prescription: Prescription; medicamentsCrees: unknown[] }> {
    return this.api.post(`/prescriptions/${id}/valider`, donnees);
  }
}
