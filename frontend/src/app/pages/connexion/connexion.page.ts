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
  ToastController,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.page.html',
  styleUrls: ['./connexion.page.scss'],
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
  ],
})
export class ConnexionPage {
  formulaire: FormGroup;
  chargement = false;
  erreur = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.formulaire = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required]],
    });
  }

  seConnecter() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = '';
    const { email, motDePasse } = this.formulaire.value;

    this.authService.connexion(email, motDePasse).subscribe({
      next: async (reponse) => {
        this.chargement = false;
        const toast = await this.toastController.create({
          message: `Bienvenue, ${reponse.user.prenom} !`,
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.rediriger(reponse.user.role);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Une erreur est survenue, réessaie.';
      },
    });
  }

  private rediriger(role: string) {
    if (role === 'medecin') this.router.navigateByUrl('/medecin/dashboard');
    else if (role === 'admin') this.router.navigateByUrl('/admin/dashboard');
    else this.router.navigateByUrl('/patient/dashboard');
  }
}
