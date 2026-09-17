import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonChip,
  IonSpinner,
  IonText,
  ToastController,
} from '@ionic/angular';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.page.html',
  styleUrls: ['./creneaux.page.scss'],
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
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonChip,
    IonSpinner,
    IonText,
  ],
})
export class CreneauxPage implements OnInit {
  medecinId = '';
  reporterId: string | null = null;
  date = new Date().toISOString().slice(0, 10);
  motif = '';
  creneaux: string[] = [];
  creneauSelectionne = '';
  chargement = false;
  enregistrement = false;
  erreur = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.medecinId = this.route.snapshot.paramMap.get('id') || '';
    this.reporterId = this.route.snapshot.queryParamMap.get('reporterId');
    this.chargerCreneaux();
  }

  chargerCreneaux() {
    this.chargement = true;
    this.creneauSelectionne = '';
    this.appointmentService.getCreneaux(this.medecinId, this.date).subscribe({
      next: ({ creneaux }) => {
        this.creneaux = creneaux;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.creneaux = [];
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectionner(creneau: string) {
    this.creneauSelectionne = creneau;
  }

  confirmer() {
    if (!this.creneauSelectionne) return;
    this.enregistrement = true;
    this.erreur = '';

    const operation = this.reporterId
      ? this.appointmentService.reporterRendezVous(this.reporterId, {
          date: this.date,
          heure: this.creneauSelectionne,
        })
      : this.appointmentService.creerRendezVous({
          medecinId: this.medecinId,
          date: this.date,
          heure: this.creneauSelectionne,
          motif: this.motif,
        });

    operation.subscribe({
      next: async () => {
        this.enregistrement = false;
        this.cdr.detectChanges();
        const toast = await this.toastController.create({
          message: this.reporterId ? 'Rendez-vous reporté' : 'Rendez-vous confirmé',
          duration: 1500,
          color: 'success',
        });
        await toast.present();
        this.router.navigateByUrl('/rendez-vous');
      },
      error: (err) => {
        this.enregistrement = false;
        this.erreur = err.error?.message || 'Une erreur est survenue.';
        this.cdr.detectChanges();
      },
    });
  }
}
