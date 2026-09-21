import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  IonIcon,
  IonText,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fingerPrintOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { BiometricService } from '../../services/biometric.service';

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
    IonIcon,
    IonText,
  ],
})
export class ConnexionPage implements OnInit {
  formulaire: FormGroup;
  chargement = false;
  erreur = '';
  biometrieDisponible = false;
  biometrieActivee = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private biometricService: BiometricService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ fingerPrintOutline });

    this.formulaire = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    this.biometrieDisponible = await this.biometricService.estDisponible();
    this.biometrieActivee = this.biometrieDisponible && (await this.biometricService.estActivee());
    this.cdr.detectChanges();
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

        // Propose d'activer la biométrie si dispo et pas déjà activée
        if (this.biometrieDisponible && !this.biometrieActivee) {
          await this.proposerActivationBiometrie(email, reponse.refreshToken);
        }

        this.rediriger(reponse.user.role);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Une erreur est survenue, réessaie.';
        this.cdr.detectChanges();
      },
    });
  }

  private async proposerActivationBiometrie(email: string, refreshToken: string) {
    const alert = await this.alertController.create({
      header: 'Connexion biométrique',
      message: 'Veux-tu activer Face ID / empreinte pour te connecter plus vite la prochaine fois ?',
      buttons: [
        { text: 'Non merci', role: 'cancel' },
        {
          text: 'Activer',
          handler: async () => {
            await this.biometricService.activer(email, refreshToken);
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
  }

  async seConnecterAvecBiometrie() {
    this.chargement = true;
    this.cdr.detectChanges();

    const succes = await this.biometricService.seConnecter();

    this.chargement = false;
    this.cdr.detectChanges();

    if (succes) {
      const role = this.authService.utilisateurActuel?.role || 'patient';
      this.rediriger(role);
    } else {
      this.erreur = "La connexion biométrique a échoué. Utilise ton mot de passe.";
      this.cdr.detectChanges();
    }
  }

  private rediriger(role: string) {
    if (role === 'medecin') this.router.navigateByUrl('/dashboard-medecin');
    else if (role === 'admin') this.router.navigateByUrl('/admin');
    else this.router.navigateByUrl('/dashboard-patient');
  }
}
