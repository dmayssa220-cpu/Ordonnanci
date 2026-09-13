import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBadge,
  ToastController,
} from '@ionic/angular';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonBadge,
  ],
})
export class ProfilPage implements OnInit {
  formulaire: FormGroup;
  utilisateur: Utilisateur | null = null;
  chargement = true;
  enregistrement = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private toastController: ToastController
  ) {
    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: [''],
      allergies: [''],
      antecedents: [''],
      specialite: [''],
      lieuExercice: [''],
    });
  }

  get estMedecin(): boolean {
    return this.utilisateur?.role === 'medecin';
  }

  ngOnInit() {
    this.authService.utilisateur$.subscribe((u) => (this.utilisateur = u));
    this.chargerProfil();
  }

  chargerProfil() {
    this.profileService.getMonProfil().subscribe({
      next: ({ utilisateur, profil }) => {
        this.utilisateur = utilisateur as Utilisateur;
        this.formulaire.patchValue({
          nom: utilisateur['nom'],
          prenom: utilisateur['prenom'],
          telephone: utilisateur['telephone'] || '',
          allergies: profil?.['allergies']?.join(', ') || '',
          antecedents: profil?.['antecedents']?.join(', ') || '',
          specialite: profil?.['specialite'] || '',
          lieuExercice: profil?.['lieuExercice'] || '',
        });
        this.chargement = false;
      },
      error: () => (this.chargement = false),
    });
  }

  enregistrer() {
    this.enregistrement = true;
    const valeurs = this.formulaire.value;

    const donnees: Record<string, unknown> = {
      nom: valeurs.nom,
      prenom: valeurs.prenom,
      telephone: valeurs.telephone,
    };

    if (this.estMedecin) {
      donnees['specialite'] = valeurs.specialite;
      donnees['lieuExercice'] = valeurs.lieuExercice;
    } else {
      donnees['allergies'] = valeurs.allergies
        ? valeurs.allergies.split(',').map((a: string) => a.trim())
        : [];
      donnees['antecedents'] = valeurs.antecedents
        ? valeurs.antecedents.split(',').map((a: string) => a.trim())
        : [];
    }

    this.profileService.mettreAJourProfil(donnees).subscribe({
      next: async () => {
        this.enregistrement = false;
        const toast = await this.toastController.create({
          message: 'Profil mis à jour',
          duration: 1500,
          color: 'success',
        });
        await toast.present();
      },
      error: () => (this.enregistrement = false),
    });
  }

  async seDeconnecter() {
    await this.authService.deconnexion();
    window.location.href = '/connexion';
  }
}
