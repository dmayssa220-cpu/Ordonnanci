import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Notifications LOCALES (programmées sur l'appareil, via Capacitor).
 * Ce n'est pas du push serveur (Firebase) — pas besoin d'infrastructure
 * externe, ça fonctionne même quand l'app est fermée, mais uniquement sur
 * CET appareil (un rappel programmé sur le téléphone du patient ne peut pas
 * notifier un médecin sur un autre appareil — ça, ce serait du vrai push).
 */
@Injectable({ providedIn: 'root' })
export class LocalNotificationService {
  async demanderPermission(): Promise<boolean> {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return true;
    const { display: nouveauStatut } = await LocalNotifications.requestPermissions();
    return nouveauStatut === 'granted';
  }

  /** Génère un id numérique stable (32 bits) à partir d'une chaîne — requis par l'API Capacitor. */
  private idNumerique(texte: string): number {
    let hash = 0;
    for (let i = 0; i < texte.length; i++) {
      hash = (hash << 5) - hash + texte.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  async annulerRappelsMedicament(medicamentId: string): Promise<void> {
    const { notifications } = await LocalNotifications.getPending();
    const aAnnuler = notifications.filter((n) => n.extra?.medicamentId === medicamentId);
    if (aAnnuler.length > 0) {
      await LocalNotifications.cancel({ notifications: aAnnuler.map((n) => ({ id: n.id })) });
    }
  }

  async planifierRappelsMedicament(params: {
    medicamentId: string;
    nom: string;
    dosage: string;
    dateDebut: string;
    dateFin: string;
    heuresPrise: string[];
  }): Promise<void> {
    const autorise = await this.demanderPermission();
    if (!autorise) return;

    const maintenant = new Date();
    const notifications: {
      id: number;
      title: string;
      body: string;
      schedule: { at: Date };
      extra: { medicamentId: string };
    }[] = [];

    const fin = new Date(params.dateFin);
    const dateCourante = new Date(params.dateDebut);

    while (dateCourante <= fin) {
      for (const heure of params.heuresPrise) {
        const [h, m] = heure.split(':').map(Number);
        const declenchement = new Date(dateCourante);
        declenchement.setHours(h, m, 0, 0);

        if (declenchement > maintenant) {
          notifications.push({
            id: this.idNumerique(`${params.medicamentId}-${declenchement.toISOString()}`),
            title: 'Rappel de médicament — Odonnanci',
            body: `C'est l'heure de prendre ${params.nom} (${params.dosage})`,
            schedule: { at: declenchement },
            extra: { medicamentId: params.medicamentId },
          });
        }
      }
      dateCourante.setDate(dateCourante.getDate() + 1);
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  }

  async planifierRappelsRendezVous(params: { rdvId: string; date: string; medecinNom?: string }): Promise<void> {
    const autorise = await this.demanderPermission();
    if (!autorise) return;

    // Annule d'éventuels rappels déjà programmés pour ce RDV (cas d'un report)
    await LocalNotifications.cancel({
      notifications: [
        { id: this.idNumerique(`${params.rdvId}-24h`) },
        { id: this.idNumerique(`${params.rdvId}-1h`) },
      ],
    }).catch(() => undefined);

    const dateRdv = new Date(params.date);
    const maintenant = new Date();
    const notifications: { id: number; title: string; body: string; schedule: { at: Date } }[] = [];
    const suffixeMedecin = params.medecinNom ? ` avec Dr ${params.medecinNom}` : '';

    const dans24h = new Date(dateRdv.getTime() - 24 * 60 * 60 * 1000);
    const dans1h = new Date(dateRdv.getTime() - 60 * 60 * 1000);

    if (dans24h > maintenant) {
      notifications.push({
        id: this.idNumerique(`${params.rdvId}-24h`),
        title: 'Rendez-vous demain — Odonnanci',
        body: `Rendez-vous${suffixeMedecin} demain`,
        schedule: { at: dans24h },
      });
    }
    if (dans1h > maintenant) {
      notifications.push({
        id: this.idNumerique(`${params.rdvId}-1h`),
        title: 'Rendez-vous dans 1 heure — Odonnanci',
        body: `Rendez-vous${suffixeMedecin} dans 1 heure`,
        schedule: { at: dans1h },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  }
}
