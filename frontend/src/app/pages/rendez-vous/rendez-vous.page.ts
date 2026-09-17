import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
  IonSpinner,
  IonFab,
  IonFabButton,
  IonIcon,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { AppointmentService, RendezVous } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.page.html',
  styleUrls: ['./rendez-vous.page.scss'],
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
    IonButton,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class RendezVousPage implements OnInit {
  rdvs: RendezVous[] = [];
  chargement = true;
  estMedecin = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ addOutline });
  }

  ngOnInit() {
    this.estMedecin = this.authService.utilisateurActuel?.role === 'medecin';
    this.charger();
  }

  charger() {
    this.chargement = true;
    this.appointmentService.getMesRendezVous().subscribe({
      next: ({ rdvs }) => {
        this.rdvs = rdvs;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  nomAutrePartie(rdv: RendezVous): string {
    const autre = this.estMedecin ? rdv.patientId : rdv.medecinId;
    if (typeof autre === 'object') {
      return this.estMedecin ? `${autre.prenom} ${autre.nom}` : `Dr ${autre.prenom} ${autre.nom}`;
    }
    return this.estMedecin ? 'Patient' : 'Médecin';
  }

  formatDate(dateIso: string): string {
    const d = new Date(dateIso);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' à ' +
      d.toISOString().slice(11, 16)
    );
  }

  classeBadge(statut: string): string {
    if (statut === 'confirme') return 'odonnanci-badge odonnanci-badge--succes';
    if (statut === 'annule') return 'odonnanci-badge odonnanci-badge--alerte';
    return 'odonnanci-badge odonnanci-badge--attente';
  }

  medecinIdPour(rdv: RendezVous): string {
    const m = rdv.medecinId;
    return typeof m === 'object' ? m._id : m;
  }

  reporter(rdv: RendezVous) {
    this.router.navigateByUrl(`/medecins/${this.medecinIdPour(rdv)}/creneaux?reporterId=${rdv._id}`);
  }

  async annuler(rdv: RendezVous) {
    const alert = await this.alertController.create({
      header: 'Annuler ce rendez-vous ?',
      buttons: [
        { text: 'Non', role: 'cancel' },
        {
          text: 'Oui, annuler',
          role: 'destructive',
          handler: () => {
            this.appointmentService.annulerRendezVous(rdv._id).subscribe(() => {
              rdv.statut = 'annule';
              this.cdr.detectChanges();
            });
          },
        },
      ],
    });
    await alert.present();
  }

  terminer(rdv: RendezVous) {
    this.appointmentService.terminerRendezVous(rdv._id).subscribe(() => {
      rdv.statut = 'termine';
      this.cdr.detectChanges();
    });
  }
}
