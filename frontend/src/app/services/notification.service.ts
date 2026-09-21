import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  private nombreNonLues = new BehaviorSubject<number>(0);
  /** Nombre de notifications non lues — s'actualise tout seul à chaque lecture/marquage. */
  nombreNonLues$ = this.nombreNonLues.asObservable();

  constructor(private api: ApiService) {}

  getNotifications(): Observable<{ notifications: NotificationItem[] }> {
    return this.api.get<{ notifications: NotificationItem[] }>('/notifications').pipe(
      tap(({ notifications }) => {
        this.nombreNonLues.next(notifications.filter((n) => !n.lu).length);
      })
    );
  }

  /** Appel léger juste pour rafraîchir le badge (utilisé sur les dashboards). */
  rafraichirCompteur(): void {
    this.getNotifications().subscribe();
  }

  marquerLue(id: string): Observable<{ notification: NotificationItem }> {
    return this.api.patch<{ notification: NotificationItem }>(`/notifications/${id}/lu`).pipe(
      tap(() => this.nombreNonLues.next(Math.max(0, this.nombreNonLues.value - 1)))
    );
  }

  marquerToutLu(): Observable<{ message: string }> {
    return this.api
      .patch<{ message: string }>('/notifications/lire-tout')
      .pipe(tap(() => this.nombreNonLues.next(0)));
  }

  mettreAJourPreferences(prefs: PreferencesNotification): Observable<{ message: string }> {
    return this.api.put('/notifications/preferences', prefs);
  }
}
