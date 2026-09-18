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
import { notificationsOutline, downloadOutline } from 'ionicons/icons';
import { DashboardService, DashboardPatient } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './dashboard-patient.page.html',
  styleUrls: ['./dashboard-patient.page.scss'],
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
export class DashboardPatientPage implements OnInit {
  dashboard: DashboardPatient | null = null;
  chargement = true;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {
    addIcons({ notificationsOutline, downloadOutline });
  }

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement = true;
    this.dashboardService.getDashboardPatient().subscribe({
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

  telechargerPdf() {
    this.dashboardService.telechargerExportPdf().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = 'historique-medical.pdf';
      lien.click();
      window.URL.revokeObjectURL(url);
    });
  }

  formatDateRdv(dateIso: string): string {
    const d = new Date(dateIso);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' à ' + d.toISOString().slice(11, 16)
    );
  }
}
