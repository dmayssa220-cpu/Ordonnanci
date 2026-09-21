import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonIcon,
  IonSpinner,
  IonText,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { PrescriptionService, Prescription } from '../../../services/prescription.service';
import { LocalNotificationService } from '../../../services/local-notification.service';

@Component({
  selector: 'app-valider-ordonnance',
  templateUrl: './valider-ordonnance.page.html',
  styleUrls: ['./valider-ordonnance.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    IonIcon,
    IonSpinner,
    IonText,
  ],
})
export class ValiderOrdonnancePage implements OnInit {
  prescriptionId = '';
  prescription: Prescription | null = null;
  formulaire: FormGroup;
  chargement = true;
  enregistrement = false;
  erreur = '';
  aEteModifie = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private localNotificationService: LocalNotificationService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ addOutline, trashOutline });
    this.formulaire = this.fb.group({ medicaments: this.fb.array([]) });
  }

  get medicaments(): FormArray {
    return this.formulaire.get('medicaments') as FormArray;
  }

  ngOnInit() {
    this.prescriptionId = this.route.snapshot.paramMap.get('id') || '';
    this.charger();
  }

  charger() {
    this.chargement = true;
    this.prescriptionService.getOrdonnance(this.prescriptionId).subscribe({
      next: ({ prescription }) => {
        this.prescription = prescription;
        this.medicaments.clear();

        const detectes = prescription.medicamentsDetectes.length
          ? prescription.medicamentsDetectes
          : [{ nom: '', dosage: '', frequence: '' }];

        detectes.forEach((m) => this.ajouterLigne(m.nom || '', m.dosage || '', m.frequence || ''));

        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.erreur = "Impossible de charger l'ordonnance.";
        this.cdr.detectChanges();
      },
    });
  }

  ajouterLigne(nom = '', dosage = '', frequence = '') {
    this.medicaments.push(
      this.fb.group({
        nom: [nom, Validators.required],
        dosage: [dosage, Validators.required],
        frequence: [frequence, Validators.required],
        heuresPrise: ['08:00', Validators.required],
        dateDebut: [new Date().toISOString().slice(0, 10), Validators.required],
        dateFin: [''],
      })
    );
    this.aEteModifie = true;
  }

  retirerLigne(index: number) {
    this.medicaments.removeAt(index);
    this.aEteModifie = true;
  }

  marquerModifie() {
    this.aEteModifie = true;
  }

  valider() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enregistrement = true;
    this.erreur = '';

    const heuresPriseParLigne: string[][] = this.medicaments.value.map((m: { heuresPrise: string }) =>
      m.heuresPrise
        .split(',')
        .map((h: string) => h.trim())
        .filter(Boolean)
    );

    const medicamentsValides = this.medicaments.value.map(
      (
        m: { nom: string; dosage: string; frequence: string; heuresPrise: string; dateDebut: string; dateFin: string },
        i: number
      ) => ({
        nom: m.nom,
        dosage: m.dosage,
        frequence: m.frequence,
        heuresPrise: heuresPriseParLigne[i],
        dateDebut: m.dateDebut,
        dateFin: m.dateFin || undefined,
      })
    );

    this.prescriptionService
      .validerOrdonnance(this.prescriptionId, { medicamentsValides, corrige: this.aEteModifie })
      .subscribe({
        next: async ({ medicamentsCrees }) => {
          this.enregistrement = false;
          this.cdr.detectChanges();

          // Programme un rappel local pour chaque médicament réellement créé
          (medicamentsCrees as { _id: string; nom: string; dosage: string; dateDebut: string; dateFin: string }[]).forEach(
            (med, i) => {
              this.localNotificationService.planifierRappelsMedicament({
                medicamentId: med._id,
                nom: med.nom,
                dosage: med.dosage,
                dateDebut: med.dateDebut,
                dateFin: med.dateFin,
                heuresPrise: heuresPriseParLigne[i] || ['08:00'],
              });
            }
          );

          const toast = await this.toastController.create({
            message: `${medicamentsValides.length} médicament(s) ajouté(s) avec leurs rappels`,
            duration: 2000,
            color: 'success',
          });
          await toast.present();
          this.router.navigateByUrl('/medicaments');
        },
        error: (err) => {
          this.enregistrement = false;
          this.erreur = err.error?.message || 'Une erreur est survenue lors de la validation.';
          this.cdr.detectChanges();
        },
      });
  }
}
