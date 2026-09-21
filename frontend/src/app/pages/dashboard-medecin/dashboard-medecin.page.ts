import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';
import { DashboardService, DashboardMedecin } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dashboard-medecin',
  templateUrl: './dashboard-medecin.page.html',
  styleUrls: ['./dashboard-medecin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
  ],
})
export class DashboardMedecinPage implements OnInit {
  dashboard: DashboardMedecin | null = null;
  chargement = true;

  constructor(
    private dashboardService: DashboardService,
    public notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ notificationsOutline });
  }

  ngOnInit() {
    this.charger();
    this.notificationService.rafraichirCompteur();
  }

  charger() {
    this.chargement = true;
    this.dashboardService.getDashboardMedecin().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatHeure(dateIso: string): string {
    return new Date(dateIso).toISOString().slice(11, 16);
  }
}
