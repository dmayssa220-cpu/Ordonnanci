import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { AuthService } from './auth.service';

const SERVEUR_BIOMETRIE = 'odonnanci-app';

/**
 * Connexion biométrique (Face ID / empreinte) via le plugin communautaire
 * capacitor-native-biometric. Principe : après une connexion classique par
 * mot de passe, on propose de stocker le refreshToken derrière le verrou
 * biométrique du système (Keychain iOS / Keystore Android — jamais en clair
 * dans le storage de l'app). Au prochain lancement, une empreinte/Face ID
 * validée récupère ce refreshToken et l'échange contre un accessToken frais
 * via /auth/refresh, sans jamais redemander le mot de passe.
 */
@Injectable({ providedIn: 'root' })
export class BiometricService {
  constructor(private authService: AuthService) {}

  async estDisponible(): Promise<boolean> {
    try {
      const resultat = await NativeBiometric.isAvailable();
      return resultat.isAvailable;
    } catch {
      return false;
    }
  }

  async estActivee(): Promise<boolean> {
    try {
      await NativeBiometric.getCredentials({ server: SERVEUR_BIOMETRIE });
      return true;
    } catch {
      return false;
    }
  }

  async activer(email: string, refreshToken: string): Promise<void> {
    await NativeBiometric.setCredentials({
      username: email,
      password: refreshToken,
      server: SERVEUR_BIOMETRIE,
    });
  }

  async desactiver(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({ server: SERVEUR_BIOMETRIE });
    } catch {
      // Rien n'était stocké — pas grave.
    }
  }

  /** Retourne true si la connexion a réussi. */
  async seConnecter(): Promise<boolean> {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Connecte-toi à Odonnanci',
        title: 'Connexion biométrique',
      });
      const credentials = await NativeBiometric.getCredentials({ server: SERVEUR_BIOMETRIE });
      return this.authService.connexionParRefreshToken(credentials.password);
    } catch {
      return false;
    }
  }
}
