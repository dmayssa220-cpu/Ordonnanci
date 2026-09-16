import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { MedicationService } from '../../../services/medication.service';

@Component({
  selector: 'app-ajouter-medicament',
  templateUrl: './ajouter-medicament.page.html',
  styleUrls: ['./ajouter-medicament.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
  ],
})
export class AjouterMedicamentPage {
  formulaire: FormGroup;
  chargement = false;
  erreur = '';

  constructor(
    private fb: FormBuilder,
    private medicationService: MedicationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ addOutline, closeOutline, trashOutline });

    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      dosage: ['', Validators.required],
      frequence: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: [''],
      heuresPrise: this.fb.array([this.fb.control('08:00', Validators.required)]),
    });
  }

  get heuresPrise(): FormArray {
    return this.formulaire.get('heuresPrise') as FormArray;
  }

  ajouterHeure() {
    this.heuresPrise.push(this.fb.control('12:00', Validators.required));
  }

  retirerHeure(index: number) {
    if (this.heuresPrise.length > 1) {
      this.heuresPrise.removeAt(index);
    }
  }

  annuler() {
    this.router.navigateByUrl('/medicaments');
  }

  enregistrer() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = '';
    const valeurs = this.formulaire.value;

    const donnees: {
      nom: string;
      dosage: string;
      frequence: string;
      heuresPrise: string[];
      dateDebut: string;
      dateFin?: string;
    } = {
      nom: valeurs.nom,
      dosage: valeurs.dosage,
      frequence: valeurs.frequence,
      heuresPrise: valeurs.heuresPrise,
      dateDebut: valeurs.dateDebut,
    };
    if (valeurs.dateFin) donnees.dateFin = valeurs.dateFin;

    this.medicationService.creerMedicament(donnees).subscribe({
      next: () => {
        this.chargement = false;
        this.cdr.detectChanges();
        this.router.navigateByUrl('/medicaments');
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || err.error?.errors?.[0]?.msg || 'Une erreur est survenue.';
        this.cdr.detectChanges();
      },
    });
  }
}
