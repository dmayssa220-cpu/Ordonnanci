import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
}

export interface ReponseAuth {
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

  inscription(donnees: Record<string, unknown>): Observable<ReponseAuth> {
    return this.api
      .post<ReponseAuth>('/auth/register', donnees)
      .pipe(switchMap((reponse) => from(this.enregistrerSession(reponse))));
  }

  connexion(email: string, motDePasse: string): Observable<ReponseAuth> {
    return this.api
      .post<ReponseAuth>('/auth/login', { email, motDePasse })
      .pipe(switchMap((reponse) => from(this.enregistrerSession(reponse))));
  }

  /**
   * IMPORTANT : cette fonction est maintenant attendue via switchMap()+from()
   * au lieu de tap(). Avec tap(), une fonction async n'est jamais attendue :
   * l'observable émettait AVANT que le token soit réellement écrit dans le
   * storage, ce qui pouvait provoquer un 401 juste après la connexion si une
   * page suivante appelait l'API trop vite. Avec switchMap()+from(), le flux
   * n'émet qu'une fois la session entièrement enregistrée.
   */
  private async enregistrerSession(reponse: ReponseAuth): Promise<ReponseAuth> {
    await this.storage.set('accessToken', reponse.accessToken);
    await this.storage.set('refreshToken', reponse.refreshToken);
    await this.storage.set('utilisateur', JSON.stringify(reponse.user));
    this.utilisateurCourant$.next(reponse.user);
    return reponse;
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
