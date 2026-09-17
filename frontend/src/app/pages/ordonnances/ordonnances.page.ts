import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { PrescriptionService, Prescription } from '../../services/prescription.service';

@Component({
  selector: 'app-ordonnances',
  templateUrl: './ordonnances.page.html',
  styleUrls: ['./ordonnances.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class OrdonnancesPage implements OnInit {
  prescriptions: Prescription[] = [];
  chargement = true;

  constructor(private prescriptionService: PrescriptionService, private cdr: ChangeDetectorRef) {
    addIcons({ cameraOutline });
  }

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement = true;
    this.prescriptionService.getMesOrdonnances().subscribe({
      next: ({ prescriptions }) => {
        this.prescriptions = prescriptions;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  classeBadge(statut: string): string {
    if (statut === 'validee' || statut === 'corrigee') return 'odonnanci-badge odonnanci-badge--succes';
    return 'odonnanci-badge odonnanci-badge--attente';
  }

  libelleStatut(statut: string): string {
    const libelles: Record<string, string> = {
      en_attente: 'En attente de validation',
      validee: 'Validée',
      corrigee: 'Validée (corrigée)',
    };
    return libelles[statut] || statut;
  }

  formatDate(dateIso: string): string {
    return new Date(dateIso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
