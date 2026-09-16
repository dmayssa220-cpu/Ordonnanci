import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Rappel {
  _id: string;
  medicationId: { _id: string; nom: string; dosage: string } | string;
  date: string;
  heure: string;
  statut: 'a_venir' | 'pris' | 'oublie' | 'reporte';
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  constructor(private api: ApiService) {}

  getRappels(date?: string): Observable<{ rappels: Rappel[] }> {
    return this.api.get('/reminders', date ? { date } : undefined);
  }

  mettreAJourStatut(
    id: string,
    statut: 'pris' | 'oublie' | 'reporte'
  ): Observable<{ rappel: Rappel }> {
    return this.api.patch(`/reminders/${id}/statut`, { statut });
  }
}
