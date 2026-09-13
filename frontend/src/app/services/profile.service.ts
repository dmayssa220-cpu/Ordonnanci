import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ProfilReponse {
  utilisateur: Record<string, any>;
  profil: Record<string, any> | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiService) {}

  getMonProfil(): Observable<ProfilReponse> {
    return this.api.get<ProfilReponse>('/profile/me');
  }

  mettreAJourProfil(donnees: Record<string, unknown>): Observable<ProfilReponse> {
    return this.api.put<ProfilReponse>('/profile/me', donnees);
  }
}
