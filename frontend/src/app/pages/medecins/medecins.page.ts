import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonList,
  IonSpinner,
  IonAvatar,
} from '@ionic/angular';
import { AppointmentService, Medecin } from '../../services/appointment.service';
import { AvatarUrlPipe } from '../../pipes/avatar-url.pipe';

@Component({
  selector: 'app-medecins',
  templateUrl: './medecins.page.html',
  styleUrls: ['./medecins.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarUrlPipe,
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
    IonList,
    IonSpinner,
    IonAvatar,
  ],
})
export class MedecinsPage implements OnInit {
  medecins: Medecin[] = [];
  chargement = false;
  recherche = '';

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.rechercher();
  }

  rechercher() {
    this.chargement = true;
    this.appointmentService.rechercherMedecins(this.recherche || undefined).subscribe({
      next: ({ medecins }) => {
        this.medecins = medecins;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.cdr.detectChanges();
      },
    });
  }

  voirCreneaux(medecin: Medecin) {
    this.router.navigateByUrl(`/medecins/${medecin.userId._id}/creneaux`);
  }
}
