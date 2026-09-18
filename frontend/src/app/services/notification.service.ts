import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  lien?: string;
  lu: boolean;
  createdAt: string;
}

export interface PreferencesNotification {
  rappelsMedicaments?: boolean;
  rappelsRendezVous?: boolean;
  messages?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private api: ApiService) {}

  getNotifications(): Observable<{ notifications: NotificationItem[] }> {
    return this.api.get('/notifications');
  }

  marquerLue(id: string): Observable<{ notification: NotificationItem }> {
    return this.api.patch(`/notifications/${id}/lu`);
  }

  marquerToutLu(): Observable<{ message: string }> {
    return this.api.patch('/notifications/lire-tout');
  }

  mettreAJourPreferences(prefs: PreferencesNotification): Observable<{ message: string }> {
    return this.api.put('/notifications/preferences', prefs);
  }
}
