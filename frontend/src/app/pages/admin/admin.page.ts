import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  IonSpinner,
  IonInput,
  IonBadge,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline } from 'ionicons/icons';
import {
  AdminService,
  UtilisateurAdmin,
  MedicamentReferentiel,
  Statistiques,
} from '../../services/admin.service';

type VueAdmin = 'statistiques' | 'utilisateurs' | 'referentiel';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
    IonSpinner,
    IonInput,
    IonBadge,
  ],
})
export class AdminPage implements OnInit {
  vue: VueAdmin = 'statistiques';

  utilisateurs: UtilisateurAdmin[] = [];
  referentiel: MedicamentReferentiel[] = [];
  statistiques: Statistiques | null = null;

  nouveauMedicamentNom = '';
  nouveauMedicamentDosages = '';

  chargement = true;

  constructor(
    private adminService: AdminService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ trashOutline, addOutline });
  }

  ngOnInit() {
    this.charger();
  }

  changerVue(vue: VueAdmin) {
    this.vue = vue;
    this.charger();
  }

  charger() {
    this.chargement = true;

    if (this.vue === 'utilisateurs') {
      this.adminService.getUsers().subscribe({
        next: ({ utilisateurs }) => {
          this.utilisateurs = utilisateurs;
          this.chargement = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.chargement = false;
          this.cdr.detectChanges();
        },
      });
    } else if (this.vue === 'referentiel') {
      this.adminService.getReferentiel().subscribe({
        next: ({ medicaments }) => {
          this.referentiel = medicaments;
          this.chargement = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.chargement = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.adminService.getStatistiques().subscribe({
        next: (stats) => {
          this.statistiques = stats;
          this.chargement = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.chargement = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  toggleStatut(u: UtilisateurAdmin) {
    this.adminService.toggleUserStatus(u._id).subscribe(() => {
      u.estActif = !u.estActif;
      this.cdr.detectChanges();
    });
  }

  async supprimerUtilisateur(u: UtilisateurAdmin) {
    const alert = await this.alertController.create({
      header: `Supprimer ${u.prenom} ${u.nom} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.adminService.deleteUser(u._id).subscribe(() => {
              this.utilisateurs = this.utilisateurs.filter((x) => x._id !== u._id);
              this.cdr.detectChanges();
            });
          },
        },
      ],
    });
    await alert.present();
  }

  ajouterMedicamentReferentiel() {
    if (!this.nouveauMedicamentNom.trim()) return;

    const dosages = this.nouveauMedicamentDosages
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    this.adminService
      .createReferentiel({ nom: this.nouveauMedicamentNom, dosagesDisponibles: dosages, interactionsConnues: [] })
      .subscribe({
        next: () => {
          this.nouveauMedicamentNom = '';
          this.nouveauMedicamentDosages = '';
          this.charger();
        },
      });
  }

  supprimerMedicamentReferentiel(m: MedicamentReferentiel) {
    this.adminService.deleteReferentiel(m._id).subscribe(() => {
      this.referentiel = this.referentiel.filter((x) => x._id !== m._id);
      this.cdr.detectChanges();
    });
  }
}
