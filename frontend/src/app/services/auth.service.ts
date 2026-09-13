import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
}

interface ReponseAuth {
  user: Utilisateur;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private utilisateurCourant$ = new BehaviorSubject<Utilisateur | null>(null);
  utilisateur$ = this.utilisateurCourant$.asObservable();

  constructor(private api: ApiService, private storage: StorageService) {}

  /** À appeler au démarrage de l'app (dans AppComponent) pour restaurer la session */
  async chargerSession(): Promise<void> {
    const utilisateurJson = await this.storage.get('utilisateur');
    if (utilisateurJson) {
      this.utilisateurCourant$.next(JSON.parse(utilisateurJson));
    }
  }

  inscription(donnees: Record<string, unknown>) {
    return this.api
      .post<ReponseAuth>('/auth/register', donnees)
      .pipe(tap((reponse) => this.enregistrerSession(reponse)));
  }

  connexion(email: string, motDePasse: string) {
    return this.api
      .post<ReponseAuth>('/auth/login', { email, motDePasse })
      .pipe(tap((reponse) => this.enregistrerSession(reponse)));
  }

  private async enregistrerSession(reponse: ReponseAuth): Promise<void> {
    await this.storage.set('accessToken', reponse.accessToken);
    await this.storage.set('refreshToken', reponse.refreshToken);
    await this.storage.set('utilisateur', JSON.stringify(reponse.user));
    this.utilisateurCourant$.next(reponse.user);
  }

  async deconnexion(): Promise<void> {
    await this.storage.clear();
    this.utilisateurCourant$.next(null);
  }

  async getAccessToken(): Promise<string | null> {
    return this.storage.get('accessToken');
  }

  get utilisateurActuel(): Utilisateur | null {
    return this.utilisateurCourant$.value;
  }
}
