import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBadge,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonAvatar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, cameraOutline } from 'ionicons/icons';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';
import { AvatarUrlPipe } from '../../pipes/avatar-url.pipe';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AvatarUrlPipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonBadge,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonAvatar,
  ],
})
export class ProfilPage implements OnInit {
  @ViewChild('photoInput') photoInput?: ElementRef<HTMLInputElement>;
  formulaire: FormGroup;
  utilisateur: Utilisateur | null = null;
  chargement = true;
  erreurChargement = false;
  enregistrement = false;
  envoiPhotoEnCours = false;
  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    public notificationService: NotificationService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ addOutline, trashOutline, cameraOutline });

    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: [''],
      allergies: [''],
      antecedents: [''],
      specialite: [''],
      lieuExercice: [''],
      disponibilites: this.fb.array([]),
    });
  }

  get estMedecin(): boolean {
    return this.utilisateur?.role === 'medecin';
  }

  get disponibilites(): FormArray {
    return this.formulaire.get('disponibilites') as FormArray;
  }

  ngOnInit() {
    this.authService.utilisateur$.subscribe((u) => (this.utilisateur = u));
    this.chargerProfil();
    this.notificationService.rafraichirCompteur();
  }

  chargerProfil() {
    this.chargement = true;
    this.erreurChargement = false;

    this.profileService.getMonProfil().subscribe({
      next: (reponse) => {
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

        this.disponibilites.clear();
        const dispos = reponse.profil?.['disponibilites'] || [];
        dispos.forEach((d: { jour: string; heureDebut: string; heureFin: string }) => {
          this.disponibilites.push(
            this.fb.group({
              jour: [d.jour, Validators.required],
              heureDebut: [d.heureDebut, Validators.required],
              heureFin: [d.heureFin, Validators.required],
            })
          );
        });

        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.erreurChargement = true;
        this.cdr.detectChanges();
      },
    });
  }

  changerPhoto() {
    if (!this.envoiPhotoEnCours) this.photoInput?.nativeElement.click();
  }

  selectionnerPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;

    this.envoiPhotoEnCours = true;
    this.cdr.detectChanges();

    this.profileService.uploaderAvatar(fichier).subscribe({
      next: async ({ utilisateur }) => {
        this.envoiPhotoEnCours = false;
        if (this.utilisateur) this.utilisateur = { ...this.utilisateur, ...utilisateur };
        input.value = '';
        this.cdr.detectChanges();
        const toast = await this.toastController.create({
          message: 'Photo de profil mise à jour',
          duration: 1500,
          color: 'success',
        });
        await toast.present();
      },
      error: async () => {
        this.envoiPhotoEnCours = false;
        input.value = '';
        this.cdr.detectChanges();
        const toast = await this.toastController.create({
          message: "Impossible d'envoyer la photo",
          duration: 2500,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  ajouterDisponibilite() {
    this.disponibilites.push(
      this.fb.group({
        jour: ['lundi', Validators.required],
        heureDebut: ['09:00', Validators.required],
        heureFin: ['17:00', Validators.required],
      })
    );
  }

  retirerDisponibilite(index: number) {
    this.disponibilites.removeAt(index);
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
      donnees['disponibilites'] = valeurs.disponibilites;
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
