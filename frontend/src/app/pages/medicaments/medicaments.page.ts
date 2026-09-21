import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { MedicationService, Medicament } from '../../services/medication.service';
import { LocalNotificationService } from '../../services/local-notification.service';

@Component({
  selector: 'app-medicaments',
  templateUrl: './medicaments.page.html',
  styleUrls: ['./medicaments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSpinner,
  ],
})
export class MedicamentsPage implements OnInit {
  medicaments: Medicament[] = [];
  chargement = true;
  observances: Record<string, number | null> = {};

  constructor(
    private medicationService: MedicationService,
    private localNotificationService: LocalNotificationService,
    private router: Router,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ addOutline, trashOutline });
  }

  ngOnInit() {
    this.chargerMedicaments();
  }

  chargerMedicaments() {
    this.chargement = true;
    this.medicationService.getMedicaments().subscribe({
      next: ({ medicaments }) => {
        this.medicaments = medicaments;
        this.chargement = false;
        this.cdr.detectChanges();
        medicaments.forEach((m) => this.chargerObservance(m._id));
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  private chargerObservance(id: string) {
    this.medicationService.getObservance(id).subscribe({
      next: ({ tauxObservance }) => {
        this.observances[id] = tauxObservance;
        this.cdr.detectChanges();
      },
      error: () => {
        this.observances[id] = null;
        this.cdr.detectChanges();
      },
    });
  }

  allerAjouter() {
    this.router.navigateByUrl('/medicaments/ajouter');
  }

  async confirmerSuppression(medicament: Medicament) {
    const alert = await this.alertController.create({
      header: 'Supprimer ce médicament ?',
      message: `${medicament.nom} et tous ses rappels seront supprimés.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => this.supprimer(medicament._id),
        },
      ],
    });
    await alert.present();
  }

  private supprimer(id: string) {
    this.medicationService.supprimerMedicament(id).subscribe(() => {
      this.medicaments = this.medicaments.filter((m) => m._id !== id);
      this.cdr.detectChanges();
      // Annule aussi les rappels locaux programmés sur l'appareil pour ce médicament
      this.localNotificationService.annulerRappelsMedicament(id);
    });
  }
}
