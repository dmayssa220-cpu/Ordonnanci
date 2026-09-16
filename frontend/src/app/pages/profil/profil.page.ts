
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
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
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { RouterLink } from '@angular/router';

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
    IonSpinner,
    RouterLink,
  ],
})
export class ProfilPage implements OnInit {
  formulaire: FormGroup;
  utilisateur: Utilisateur | null = null;
  chargement = true;
  erreurChargement = false;
  enregistrement = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private toastController: ToastController,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
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
    console.log('========== CHARGEMENT PROFIL ==========');
    this.chargement = true;
    this.erreurChargement = false;

    this.profileService.getMonProfil().subscribe({
      next: (reponse) => {
        console.log('PROFILE RESPONSE:', reponse);

        this.utilisateur = reponse.utilisateur as Utilisateur;
        this.formulaire.patchValue({
          nom: reponse.utilisateur['nom'] || '',
          prenom: reponse.utilisateur['prenom'] || '',
          telephone: reponse.utilisateur['telephone'] || '',
          allergies: reponse.profil?.['allergies']?.join(', ') || '',
          antecedents: reponse.profil?.['antecedents']?.join(', ') || '',
          specialite: reponse.profil?.['specialite'] || '',
          lieuExercice: reponse.profil?.['lieuExercice'] || '',
        });
        this.chargement = false;

        console.log('chargement =', this.chargement, '— forçage détectChanges() maintenant');
        this.cdr.detectChanges();
        console.log('detectChanges() exécuté');
      },
      error: (erreur) => {
        console.error('PROFILE ERROR:', erreur);
        this.chargement = false;
        this.erreurChargement = true;
        this.cdr.detectChanges();
      },
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
        this.cdr.detectChanges();
        const toast = await this.toastController.create({
          message: 'Profil mis à jour',
          duration: 1500,
          color: 'success',
        });
        await toast.present();
      },
      error: () => {
        this.enregistrement = false;
        this.cdr.detectChanges();
      },
    });
  }

  async seDeconnecter() {
    await this.authService.deconnexion();
    window.location.href = '/connexion';
  }
}


