import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToggle,
} from '@ionic/angular';
import { NotificationService, NotificationItem } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonToggle,
  ],
})
export class NotificationsPage implements OnInit {
  notifications: NotificationItem[] = [];
  chargement = true;
  prefs = { rappelsMedicaments: true, rappelsRendezVous: true, messages: true };

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement = true;
    this.notificationService.getNotifications().subscribe({
      next: ({ notifications }) => {
        this.notifications = notifications;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  marquerLue(n: NotificationItem) {
    if (n.lu) return;
    this.notificationService.marquerLue(n._id).subscribe(() => {
      n.lu = true;
      this.cdr.detectChanges();
    });
  }

  marquerToutLu() {
    this.notificationService.marquerToutLu().subscribe(() => {
      this.notifications.forEach((n) => (n.lu = true));
      this.cdr.detectChanges();
    });
  }

  changerPreference(cle: 'rappelsMedicaments' | 'rappelsRendezVous' | 'messages', valeur: boolean) {
    this.prefs[cle] = valeur;
    this.notificationService.mettreAJourPreferences({ [cle]: valeur }).subscribe();
  }
}
