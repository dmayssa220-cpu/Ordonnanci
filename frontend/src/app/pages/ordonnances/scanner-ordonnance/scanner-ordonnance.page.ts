import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { PrescriptionService } from '../../../services/prescription.service';

@Component({
  selector: 'app-scanner-ordonnance',
  templateUrl: './scanner-ordonnance.page.html',
  styleUrls: ['./scanner-ordonnance.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
  ],
})
export class ScannerOrdonnancePage {
  photoApercu: string | null = null;
  envoiEnCours = false;
  erreur = '';

  constructor(
    private prescriptionService: PrescriptionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ cameraOutline });
  }

  async prendrePhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (!photo.dataUrl) return;

      this.traiterImage(photo.dataUrl);
    } catch {
      this.erreur = 'La caméra est indisponible sur cet appareil.';
      this.cdr.detectChanges();
    }
  }

  choisirOrdonnance(event: Event) {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;

    if (!fichier.type.startsWith('image/')) {
      this.erreur = 'Veuillez sélectionner une image.';
      input.value = '';
      return;
    }

    const lecteur = new FileReader();
    lecteur.onload = () => {
      if (typeof lecteur.result === 'string') this.traiterImage(lecteur.result);
      input.value = '';
    };
    lecteur.onerror = () => {
      this.erreur = "Impossible de lire l'image sélectionnée.";
      input.value = '';
      this.cdr.detectChanges();
    };
    lecteur.readAsDataURL(fichier);
  }

  private traiterImage(dataUrl: string) {
    this.photoApercu = dataUrl;
    this.erreur = '';
    this.cdr.detectChanges();
    this.envoyer(dataUrl);
  }

  private dataUrlVersBlob(dataUrl: string): Blob {
    const [entete, base64] = dataUrl.split(',');
    const mimeMatch = entete.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binaire = atob(base64);
    const tableau = new Uint8Array(binaire.length);
    for (let i = 0; i < binaire.length; i++) tableau[i] = binaire.charCodeAt(i);
    return new Blob([tableau], { type: mime });
  }

  private envoyer(dataUrl: string) {
    this.envoiEnCours = true;
    this.erreur = '';
    const blob = this.dataUrlVersBlob(dataUrl);

    this.prescriptionService.uploaderOrdonnance(blob).subscribe({
      next: ({ prescription }) => {
        this.envoiEnCours = false;
        this.cdr.detectChanges();
        this.router.navigateByUrl(`/ordonnances/${prescription._id}/valider`);
      },
      error: (err) => {
        this.envoiEnCours = false;
        this.erreur = err.error?.message || "Erreur lors de l'analyse de l'ordonnance.";
        this.cdr.detectChanges();
      },
    });
  }
}
