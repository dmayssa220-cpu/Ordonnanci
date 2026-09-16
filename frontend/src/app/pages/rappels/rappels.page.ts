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
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  ActionSheetController,
} from '@ionic/angular';
import { ReminderService, Rappel } from '../../services/reminder.service';

@Component({
  selector: 'app-rappels',
  templateUrl: './rappels.page.html',
  styleUrls: ['./rappels.page.scss'],
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
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
  ],
})
export class RappelsPage implements OnInit {
  rappels: Rappel[] = [];
  chargement = true;
  aujourdHui = new Date().toISOString().slice(0, 10);

  constructor(
    private reminderService: ReminderService,
    private actionSheetController: ActionSheetController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerRappels();
  }

  chargerRappels(event?: { target?: { complete: () => void } }) {
    this.chargement = true;
    this.reminderService.getRappels(this.aujourdHui).subscribe({
      next: ({ rappels }) => {
        this.rappels = rappels;
        this.chargement = false;
        this.cdr.detectChanges();
        event?.target?.complete();
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
        event?.target?.complete();
      },
    });
  }

  nomMedicament(rappel: Rappel): string {
    const med = rappel.medicationId;
    return typeof med === 'object' ? `${med.nom} (${med.dosage})` : 'Médicament';
  }

  classeBadge(statut: string): string {
    if (statut === 'pris') return 'odonnanci-badge odonnanci-badge--succes';
    if (statut === 'oublie') return 'odonnanci-badge odonnanci-badge--alerte';
    return 'odonnanci-badge odonnanci-badge--attente';
  }

  libelleStatut(statut: string): string {
    const libelles: Record<string, string> = {
      a_venir: 'À venir',
      pris: 'Pris',
      oublie: 'Oublié',
      reporte: 'Reporté',
    };
    return libelles[statut] || statut;
  }

  async changerStatut(rappel: Rappel) {
    const actionSheet = await this.actionSheetController.create({
      header: this.nomMedicament(rappel),
      buttons: [
        { text: 'Marquer comme pris', handler: () => this.mettreAJour(rappel, 'pris') },
        { text: 'Marquer comme oublié', handler: () => this.mettreAJour(rappel, 'oublie') },
        { text: 'Reporter', handler: () => this.mettreAJour(rappel, 'reporte') },
        { text: 'Annuler', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private mettreAJour(rappel: Rappel, statut: 'pris' | 'oublie' | 'reporte') {
    this.reminderService.mettreAJourStatut(rappel._id, statut).subscribe(() => {
      rappel.statut = statut;
      this.cdr.detectChanges();
    });
  }
}
