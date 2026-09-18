import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.page.html',
  styleUrls: ['./inscription.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSegment,
    IonSegmentButton,
  ],
})
export class InscriptionPage {
  formulaire: FormGroup;
  chargement = false;
  erreur = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['patient', Validators.required],
      specialite: [''],
    });
  }

  get estMedecin(): boolean {
    return this.formulaire.get('role')?.value === 'medecin';
  }

  sInscrire() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = '';

    this.authService.inscription(this.formulaire.value).subscribe({
      next: (reponse) => {
        this.chargement = false;
        // Redirection directe vers /profil, même raison que dans ConnexionPage.
        this.router.navigateByUrl(reponse.user.role === 'medecin' ? '/dashboard-medecin' : '/dashboard-patient');
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || err.error?.errors?.[0]?.msg || 'Une erreur est survenue.';
      },
    });
  }
}
